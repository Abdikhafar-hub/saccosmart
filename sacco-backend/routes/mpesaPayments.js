const express = require("express");
const axios = require("axios");
// const verifyToken = require("../middleware/authMiddleware"); // Uncomment when needed

require("dotenv").config();

const router = express.Router();

const shortCode = process.env.MPESA_SHORTCODE || "174379";
const passKey = process.env.MPESA_PASSKEY;
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const callbackUrl = process.env.MPESA_CALLBACK_URL || "https://yourwebsite.com/api/payment/callback";



const getTimestamp = () => {
  const date = new Date();
  return `${date.getFullYear()}${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getDate()).slice(-2)}${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(-2)}${("0" + date.getSeconds()).slice(-2)}`;
};



const getMpesaAccessToken = async () => {
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error(" Failed to fetch M-Pesa access token:", error.response?.data || error.message);
    return null;
  }
};


// Initiate STK Push
const initiateStkPush = async (phone, amount=1) => {
  try {
    const accessToken = await getMpesaAccessToken();
    if (!accessToken) throw new Error("Unable to get M-Pesa access token.");

    const timestamp = getTimestamp();
    const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString("base64");

    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: "Smart-Sacco",
      TransactionDesc: "Sacco Contribution",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(" STK Push Error:", error.response?.data || error.message);
    return { error: error.response?.data || "STK Push failed" };
  }
};



router.post("/mpesa-stk", /* verifyToken, */ async (req, res) => {
  const { phone, amount, memberId } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ message: "Phone and amount are required." });
  }

  try {
    const result = await initiateStkPush(phone, amount, memberId || `USER-${Date.now()}`, "Sacco Contribution");

    if (result.error) {
      return res.status(500).json({ message: "Failed to initiate STK Push", error: result.error });
    }

    if (result.ResponseCode === "0") {
      return res.status(200).json({ message: "STK Push initiated successfully", data: result });
    } else {
      return res.status(400).json({ message: result.ResponseDescription || "STK Push request failed", data: result });
    }
  } catch (error) {
    console.error(" Server Error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


// POST /api/payment/callback
router.post("/callback", (req, res) => {
  const callbackData = req.body.Body?.stkCallback;

  console.log(" Callback received:", JSON.stringify(callbackData, null, 2));

  if (!callbackData || callbackData.ResultCode !== 0) {
    console.log(" Payment failed or cancelled:", callbackData?.ResultDesc);
    return res.status(400).send("Payment failed.");
  }

  console.log(" Payment successful:", callbackData);
  res.status(200).send("Payment received.");
});

module.exports = router;
