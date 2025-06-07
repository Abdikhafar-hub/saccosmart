const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');

// Contributions Over Time (Line Chart)
exports.getContributionsTrend = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const pipeline = [
      { $match: { date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
      {
        $group: {
          _id: { $month: "$date" },
          value: { $sum: "$amount" }
        }
      }
    ];
    const data = await Contribution.aggregate(pipeline);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = months.map((name, i) => ({
      name,
      value: data.find(d => d._id === i + 1)?.value || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contributions trend' });
  }
};

// Loan Status Distribution (Pie Chart)
exports.getLoanStatusDistribution = async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: "$status", value: { $sum: 1 } } }
    ];
    const data = await Loan.aggregate(pipeline);
    const statusMap = { active: "Active", pending: "Pending", completed: "Completed", defaulted: "Defaulted" };
    const result = Object.entries(statusMap).map(([key, name]) => ({
      name,
      value: data.find(d => d._id === key)?.value || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loan status distribution' });
  }
};
