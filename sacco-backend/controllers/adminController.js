const User = require('../models/User');
const Loan = require('../models/Loan');
const Contribution = require('../models/Contribution');

// Get admin dashboard statistics
exports.getStats = async (req, res) => {
    try {
        const totalMembers = await User.countDocuments({ role: 'member' });
        const totalLoans = await Loan.countDocuments();
        const activeLoans = await Loan.countDocuments({ status: 'active' });
        const totalContributions = await Contribution.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const recentLoans = await Loan.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        res.json({
            totalMembers,
            totalLoans,
            activeLoans,
            totalContributions: totalContributions[0]?.total || 0,
            recentLoans
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin statistics', error: error.message });
    }
};

// Get all loans with filtering and pagination
exports.getLoans = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = status ? { status } : {};

        const loans = await Loan.find(query)
            .populate('user', 'name email memberCode')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Loan.countDocuments(query);

        res.json({
            loans,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loans', error: error.message });
    }
}; 