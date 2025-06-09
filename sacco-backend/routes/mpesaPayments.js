const express = require("express");
const axios = require("axios");
const Contribution = require('../models/Contribution'); // Ensure this is correctly imported
const User = require('../models/User'); // Ensure this path is correct

require("dotenv").config();

const router = express.Router();

const shortCode = process.env.MPESA_SHORTCODE || "174379";
const passKey = process.env.MPESA_PASSKEY;
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const callbackUrl = process.env.MPESA_CALLBACK_URL || "https://yourwebsite.com/api/payment/callback";

// Function to get timestamp for M-Pesa request
const getTimestamp = () => {
  const date = new Date();
  return `${date.getFullYear()}${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getDate()).slice(-2)}${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(-2)}${("0" + date.getSeconds()).slice(-2)}`;
};

// Function to get M-Pesa access token
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
    console.error("Failed to fetch M-Pesa access token:", error.response?.data || error.message);
    return null;
  }
};

// Function to initiate the STK Push (M-Pesa Payment Request)
const initiateStkPush = async (phone, amount = 1) => {
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
    console.error("STK Push Error:", error.response?.data || error.message);
    return { error: error.response?.data || "STK Push failed" };
  }
};

// POST /api/mpesa-stk - Initiate the STK push for M-Pesa
router.post("/mpesa-stk", async (req, res) => {
  const { phone, amount, memberId } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ message: "Phone and amount are required." });
  }

  try {
    // Log memberId for debugging purposes
    console.log("Searching for user with email:", memberId);

    // Case-insensitive search for email
    const user = await User.findOne({ email: { $regex: new RegExp(`^${memberId}$`, 'i') } });
    
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Proceed with STK push for M-Pesa
    const result = await initiateStkPush(phone, amount);

    if (result.error) {
      return res.status(500).json({ message: "Failed to initiate STK Push", error: result.error });
    }

    // Save the contribution with 'Pending' status
    const contribution = await Contribution.create({
      user: user._id,  // Use the user's ObjectId here
      amount: amount,
      method: 'M-Pesa',
      reference: result.MerchantRequestID || Date.now().toString(),  // Use unique ID for reference
      status: 'Pending',  // Set initial status to 'Pending'
      date: new Date(),
    });

    // Respond with the STK push initiation result and contribution record
    if (result.ResponseCode === "0") {
      return res.status(200).json({
        message: "STK Push initiated successfully",
        data: result,
        contribution: contribution,  // Return the created contribution record
      });
    } else {
      return res.status(400).json({ message: result.ResponseDescription || "STK Push request failed", data: result });
    }
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


// POST /api/payment/callback - M-Pesa callback to handle payment response
router.post("/callback", async (req, res) => {
  const callbackData = req.body.Body?.stkCallback;

  console.log("Callback received:", JSON.stringify(callbackData, null, 2));

  if (!callbackData || callbackData.ResultCode !== 0) {
    console.log("Payment failed or cancelled:", callbackData?.ResultDesc);
    return res.status(400).send("Payment failed.");
  }

  console.log("Payment successful:", callbackData);

  // Update the contribution status to 'Verified'
  const reference = callbackData.MerchantRequestID;

  try {
    // Find the contribution by its reference and update its status to "Verified"
    const contribution = await Contribution.findOneAndUpdate(
      { reference: reference },
      { status: "Verified" },
      { new: true }
    );

    if (!contribution) {
      return res.status(404).send("Contribution not found.");
    }

    return res.status(200).send("Payment received and contribution verified.");
  } catch (error) {
    console.error("Error updating contribution status:", error);
    return res.status(500).send("Failed to update contribution status.");
  }
});

module.exports = router;
