const User = require('../models/User');
const Contribution = require('../models/Contribution');
const Activity = require('../models/Activity');
const axios = require('axios');

// Robust createContribution function (used for POST /api/contribution)
exports.createContribution = async (req, res) => {
  try {
    const { amount, method, mpesaCode, bankRef, reference } = req.body;
    const userId = req.user.id;
    // Fetch user from DB to get the name
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (!user.name) {
      return res.status(400).json({ error: "User name is missing in the database" });
    }
    const contribution = await Contribution.create({
      user: userId,
      amount,
      method,
      mpesaCode,
      bankRef,
      reference,
      status: "Pending",
      date: new Date()
    });
    await Activity.create({
      userName: user && user.name ? user.name : "Unknown",
      action: "Made contribution",
      amount,
      type: "contribution"
    });
    res.status(201).json(contribution);
  } catch (err) {
    console.error('Create Contribution Error:', err);
    res.status(500).json({ error: "Failed to create contribution" });
  }
};

// For admin: get all contributions
exports.getAllContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({})
      .populate("user", "name email")
      .sort({ date: -1 });
    res.json(contributions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contributions" });
  }
};

// For member: get own contributions
exports.getMemberContributions = async (req, res) => {
  try {
    const userId = req.user.id;
    const contributions = await Contribution.find({ user: userId }).sort({ date: -1 });
    res.json(contributions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contributions" });
  }
};

exports.approveContribution = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const admin = await User.findById(adminId);
    const adminName = admin && admin.name ? admin.name : "Unknown";
    const contribution = await Contribution.findByIdAndUpdate(
      id,
      { status: "Verified", verifiedBy: adminName, verifiedAt: new Date() },
      { new: true }
    );
    await Activity.create({
      userName: adminName,
      action: "Verified contribution",
      amount: contribution.amount,
      type: "contribution"
    });
    res.json(contribution);
  } catch (err) {
    console.error('Approve Contribution Error:', err);
    res.status(500).json({ error: "Failed to approve contribution" });
  }
};

exports.rejectContribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;
    const admin = await User.findById(adminId);
    const adminName = admin && admin.name ? admin.name : "Unknown";
    const contribution = await Contribution.findByIdAndUpdate(
      id,
      { status: "Rejected", rejectedBy: adminName, rejectedAt: new Date(), rejectionReason },
      { new: true }
    );
    await Activity.create({
      userName: adminName,
      action: "Rejected contribution",
      amount: contribution.amount,
      type: "contribution"
    });
    res.json(contribution);
  } catch (err) {
    console.error('Reject Contribution Error:', err);
    res.status(500).json({ error: "Failed to reject contribution" });
  }
};

exports.verifyPayment = async (req, res) => {
  const { reference } = req.params;
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const { status, data } = response.data;
    if (status === 'success' && data.status === 'success') {
      const { amount, reference } = data;
      const contribution = await Contribution.create({
        user: req.user.id,
        amount: amount / 100, // Convert from kobo to Naira
        reference,
        method: 'Paystack',
        status: 'success',
        date: new Date()
      });
      return res.status(201).json(contribution);
    } else {
      return res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment Verification Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};