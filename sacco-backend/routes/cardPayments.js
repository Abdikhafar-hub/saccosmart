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

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100,
        metadata: { memberId },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    
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

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    console.log(" Paystack full response:");
    console.dir(response.data, { depth: null });

    const { status, data } = response.data;

    
    if ((status === true || status === 'success') && data.status === 'success') {

      
      const existing = await Contribution.findOne({ reference });
      if (existing) {
        return res.status(200).json(existing);
      }

      
      const memberEmail = data.metadata?.memberId;
      if (!memberEmail) {
        return res.status(400).json({ error: 'Missing member email in metadata.' });
      }

      
      const user = await User.findOne({ email: memberEmail });
      if (!user) {
        return res.status(400).json({ error: 'Member not found in the system.' });
      }

      
      const contribution = await Contribution.create({
        user: user._id,
        amount: data.amount / 100, // convert from kobo
        reference,
        method: 'Paystack',
        status: 'success',
        date: new Date()
      });

      return res.status(201).json(contribution);
    } else {
      // Handle failed or incomplete payment
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