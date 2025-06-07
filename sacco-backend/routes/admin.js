const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Loan = require('../models/Loan');
const User = require('../models/User');
const Contribution = require('../models/Contribution');
const loanController = require('../controllers/loanController');

// Get admin dashboard stats
router.get('/stats', [auth, admin], async (req, res) => {
    try {
        const totalMembers = await User.countDocuments({ role: 'member' });
        const totalLoans = await Loan.countDocuments();
        const activeLoans = await Loan.countDocuments({ status: 'active' });
        const totalContributions = await Contribution.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const recentLoansRaw = await Loan.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        // Transform recentLoans to include userId and userName
        const recentLoans = recentLoansRaw.map(loan => ({
            _id: loan._id,
            userId: loan.user?._id,
            userName: loan.user?.name,
            amount: loan.amount,
            status: loan.status,
            date: loan.date,
            term: loan.term,
            purpose: loan.purpose,
            balance: loan.balance,
            disbursedAmount: loan.disbursedAmount,
            interestRate: loan.interestRate,
            monthlyPayment: loan.monthlyPayment,
            nextDueDate: loan.nextDueDate,
            completedDate: loan.completedDate,
            rejectedDate: loan.rejectedDate,
            rejectionReason: loan.rejectionReason,
        }));

        res.json({
            totalMembers,
            totalLoans,
            activeLoans,
            totalContributions: totalContributions[0]?.total || 0,
            recentLoans
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all loans with filtering and pagination
router.get('/loans', [auth, admin], async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = {};
        if (status) query.status = status;

        const loans = await Loan.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Loan.countDocuments(query);

        const transformedLoans = loans.map(loan => ({
            _id: loan._id,
            userId: loan.user?._id,
            userName: loan.user?.name,
            amount: loan.amount,
            status: loan.status,
            date: loan.date,
            term: loan.term,
            purpose: loan.purpose,
            balance: loan.balance,
            disbursedAmount: loan.disbursedAmount,
            interestRate: loan.interestRate,
            monthlyPayment: loan.monthlyPayment,
            nextDueDate: loan.nextDueDate,
            completedDate: loan.completedDate,
            rejectedDate: loan.rejectedDate,
            rejectionReason: loan.rejectionReason,
        }));

        res.json({
            loans: transformedLoans,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/loans/:id/approve', [auth, admin], loanController.approveLoan);
router.post('/loans/:id/reject', [auth, admin], loanController.rejectLoan);

module.exports = router; 