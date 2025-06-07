const Loan = require('../models/Loan');
const Backup = require('../models/Backup');
const Activity = require('../models/Activity');

// System Alerts
exports.getSystemAlerts = async (req, res) => {
  try {
    const overdueLoans = await Loan.find({ status: "overdue" });
    const pendingLoans = await Loan.countDocuments({ status: "pending" });
    const lastBackup = await Backup.findOne().sort({ createdAt: -1 });

    res.json({
      overdueLoans: {
        count: overdueLoans.length,
        totalAmount: overdueLoans.reduce((sum, l) => sum + l.amount, 0)
      },
      pendingLoans: { count: pendingLoans },
      lastBackup: lastBackup?.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system alerts' });
  }
};

// Recent System Activity Table
exports.getSystemActivity = async (req, res) => {
  try {
    const activities = await Activity.find({}).sort({ createdAt: -1 }).limit(20);
    res.json(activities.map(a => ({
      id: a._id,
      user: a.userName,
      action: a.action,
      amount: a.amount ? `KES ${a.amount.toLocaleString()}` : "-",
      time: a.createdAt,
      type: a.type
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system activity' });
  }
};
