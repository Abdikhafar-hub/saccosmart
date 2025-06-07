const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/mpesa-stk', async (req, res) => {
  const { amount, phone, memberId, method } = req.body;
  try {
    // 1. Get access token
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const { data: tokenRes } = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const access_token = tokenRes.access_token;

    // 2. Initiate STK Push
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const stkPayload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: memberId,
      TransactionDesc: "Sacco Contribution"
    };

    const { data: stkRes } = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPayload,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (stkRes.ResponseCode === "0") {
      return res.json({ success: true, message: "STK Push initiated. Check your phone." });
    } else {
      return res.status(400).json({ message: stkRes.ResponseDescription || "STK Push failed" });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ message: "Failed to initiate M-Pesa payment" });
  }
});

module.exports = router;
