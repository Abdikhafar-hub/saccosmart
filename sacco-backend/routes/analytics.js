const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const Loan = require('../models/Loan');

// Placeholder endpoints (implement as needed)
router.get('/contributions-trend', analyticsController.getContributionsTrend || ((req, res) => res.json([])));
router.get('/loan-status-distribution', async (req, res) => {
  try {
    const statuses = await Loan.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } }
    ]);
    const result = statuses.map(s => ({
      name: s._id,
      value: s.value
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
