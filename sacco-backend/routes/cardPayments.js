const express = require('express');
const axios = require('axios');
const Contribution = require('../models/Contribution');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth'); // adjust path if needed

// POST /api/card/initiate
// Initiate a Paystack transaction and return the authorization_url
router.post('/initiate', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const email = req.user.email;
    const memberId = req.user._id;

    // Call Paystack API to initiate the transaction
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100,  // Paystack expects the amount in kobo
        metadata: { memberId },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Send the necessary Paystack details to the frontend
    return res.json({
      email,
      reference: response.data.data.reference,
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
    });
  } catch (error) {
    console.error('Paystack Initiate Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initiate card payment' });
  }
});

// GET /api/card/verify/:reference
// Verify a Paystack transaction and record the contribution
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    console.log(" Verifying Paystack reference:", reference);

    // Call Paystack API to verify the transaction
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    console.log(" Paystack full response:");
    console.dir(response.data, { depth: null });

    const { status, data } = response.data;

    // Ensure correct condition check for Paystack's status and transaction status
    if (status === true && data.status === 'success') {
      // Check if the contribution with the given reference already exists
      const existing = await Contribution.findOne({ reference });
      if (existing) {
        return res.status(200).json(existing);
      }

      // Retrieve the member's email from metadata
      const memberEmail = data.metadata?.memberId;
      if (!memberEmail) {
        return res.status(400).json({ error: 'Missing member email in metadata.' });
      }

      // Find the user associated with the provided email
      const user = await User.findOne({ email: memberEmail });
      if (!user) {
        return res.status(400).json({ error: 'Member not found in the system.' });
      }

      // Create the contribution record
      const contribution = await Contribution.create({
        user: user._id,
        amount: data.amount / 100,  // Convert from kobo to naira
        reference,
        method: 'Paystack',
        status: 'success',  // Ensure 'success' is valid in the Contribution schema
        date: new Date()
      });

      return res.status(201).json(contribution);
    } else {
      console.warn(" Payment not successful:", {
        status: data.status,
        gateway_response: data.gateway_response,
        message: data.message,
      });

      return res.status(400).json({
        error: 'Payment verification failed.',
        paystackStatus: status,
        transactionStatus: data.status,
        message: data.gateway_response || data.message || 'No details'
      });
    }
  } catch (error) {
    console.error(' Paystack Verify Error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to verify card payment.',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
