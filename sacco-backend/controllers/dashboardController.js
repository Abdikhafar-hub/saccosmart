const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');
const User = require('../models/User');

exports.memberDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('name email role avatar');
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const contributions = await Contribution.find({ user: userId }).sort({ date: 1 }); // Sort by date for calculations
    const loans = await Loan.find({ user: userId }).sort({ date: -1 }); // Sort by date for latest loan

    // --- Calculations for Dashboard Stats --- //m  

    // Total Contributions Trend
    const totalContributions = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const contributionsLastMonth = contributions
      .filter(c => c.date >= startOfLastMonth && c.date <= endOfLastMonth)
      .reduce((sum, c) => sum + (c.amount || 0), 0);
    const contributionsThisMonth = contributions
      .filter(c => c.date >= startOfThisMonth && c.date <= now)
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    const totalContributionsTrend = contributionsLastMonth === 0 ?
      (contributionsThisMonth > 0 ? 100 : 0) :
      ((contributionsThisMonth - contributionsLastMonth) / contributionsLastMonth) * 100;

    // Active Loan Trend (dynamic calculation)
    const activeLoans = loans.filter(l => ['approved', 'active'].includes(l.status));
    const currentLoanBalance = activeLoans.reduce((sum, l) => sum + (l.amount || 0), 0);

    // Calculate last month's active loan balance
    const lastMonthLoans = loans.filter(l => ['approved', 'active'].includes(l.status) && l.date >= startOfLastMonth && l.date <= endOfLastMonth);
    const lastMonthLoanBalance = lastMonthLoans.reduce((sum, l) => sum + (l.amount || 0), 0);

    let activeLoanTrend = 0;
    let isLoanTrendPositive = false;
    if (lastMonthLoanBalance === 0) {
      activeLoanTrend = 0;
      isLoanTrendPositive = true;
    } else {
      activeLoanTrend = ((currentLoanBalance - lastMonthLoanBalance) / lastMonthLoanBalance) * 100;
      isLoanTrendPositive = activeLoanTrend >= 0;
    }

    // Monthly Target & Progress (assuming a fixed target for now, fetch from config/DB if dynamic)
    const monthlyTargetAmount = 50000;
    const currentMonthContributed = contributionsThisMonth; // Already calculated
    const monthlyProgressPercentage = monthlyTargetAmount === 0 ?
      (currentMonthContributed > 0 ? 100 : 0) :
      (currentMonthContributed / monthlyTargetAmount) * 100;

    // Next Due Date (dynamic: soonest nextDueDate among active loans)
    let nextDueDate = null;
    let nextDueDateDescription = "No active loans";
    if (activeLoans.length > 0) {
      // Filter out loans without a nextDueDate
      const loansWithDueDate = activeLoans.filter(l => l.nextDueDate);
      if (loansWithDueDate.length > 0) {
        nextDueDate = loansWithDueDate.reduce((soonest, l) => {
          return (!soonest || l.nextDueDate < soonest.nextDueDate) ? l : soonest;
        }).nextDueDate;
        nextDueDateDescription = "Loan payment due";
      }
    }

    // --- Prepare Response --- //
    res.json({
      user,
      totalContributions,
      totalContributionsTrend: Number(totalContributionsTrend.toFixed(2)),
      activeLoanBalance: currentLoanBalance,
      activeLoanTrend: Number(activeLoanTrend.toFixed(2)),
      isLoanTrendPositive: isLoanTrendPositive,
      monthlyTargetAmount: monthlyTargetAmount, // Placeholder
      currentMonthContributed: currentMonthContributed,
      monthlyProgressPercentage: Number(monthlyProgressPercentage.toFixed(2)),
      nextDueDate: nextDueDate,
      nextDueDateDescription: nextDueDateDescription,
      // Include contributions and loans if still needed on dashboard page, or fetch separately
      contributions: contributions, // Still sending for chart calculation on frontend
      loans: loans // Still sending for active loan balance calculation on frontend
    });
  } catch (err) {
    console.error('Member Dashboard Error:', err);
    res.status(500).json({ error: 'Failed to fetch member dashboard data' });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const members = await User.find({ status: 'active' }).select('name email');
    const contributions = await Contribution.find({ status: "Verified" });
    const loans = await Loan.find({});

    // Outstanding loans
    const outstandingLoans = loans.filter(l => ['approved', 'active'].includes(l.status));
    // Monthly growth
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const usersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const usersLastMonth = await User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } });
    const monthlyGrowth = usersLastMonth === 0 ? 100 : ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;

    res.json({
      members,
      contributions,
      loans,
      monthlyGrowth: Number(monthlyGrowth.toFixed(2))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
  }
};