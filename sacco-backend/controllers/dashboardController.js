const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');
const User = require('../models/User');

exports.memberDashboard = async (req, res) => {
  try {
  const userId = req.user.id;
    const user = await User.findById(userId).select('name email role');
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const contributions = await Contribution.find({ user: userId }).sort({ date: 1 }); // Sort by date for calculations
    const loans = await Loan.find({ user: userId }).sort({ date: -1 }); // Sort by date for latest loan

    // --- Calculations for Dashboard Stats --- //

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

    // Active Loan Trend (assuming trend is based on change in active balance, which might need more complex logic, using loan count for simplicity for now)
    const activeLoans = loans.filter(l => ['approved', 'active'].includes(l.status));
    const currentLoanBalance = activeLoans.reduce((sum, l) => sum + (l.amount || 0), 0);
    // For a real trend, you'd need loan repayment history and track balance over time.
    // Placeholder trend for now:
    const activeLoanTrend = -8; // Replace with real calculation if possible
    const isLoanTrendPositive = false; // Based on placeholder value

    // Monthly Target & Progress (assuming a fixed target for now, fetch from config/DB if dynamic)
    const monthlyTargetAmount = 5000;
    const currentMonthContributed = contributionsThisMonth; // Already calculated
    const monthlyProgressPercentage = monthlyTargetAmount === 0 ?
      (currentMonthContributed > 0 ? 100 : 0) :
      (currentMonthContributed / monthlyTargetAmount) * 100;

    // Next Due Date (assuming latest active loan has a dueDate field - needs model update if not)
    const latestActiveLoan = activeLoans.length > 0 ? activeLoans[0] : null;
    // Assuming loan model has 'dueDate' field
    const nextDueDate = latestActiveLoan?.dueDate || null; // Needs Loan model update
    const nextDueDateDescription = nextDueDate ? "Loan payment due" : "No active loans";

    // --- Prepare Response --- //
    res.json({
      user,
      totalContributions,
      totalContributionsTrend: Number(totalContributionsTrend.toFixed(2)),
      activeLoanBalance: currentLoanBalance,
      activeLoanTrend: activeLoanTrend, // Placeholder
      isLoanTrendPositive: isLoanTrendPositive, // Placeholder
      monthlyTargetAmount: monthlyTargetAmount, // Placeholder
      currentMonthContributed: currentMonthContributed,
      monthlyProgressPercentage: Number(monthlyProgressPercentage.toFixed(2)),
      nextDueDate: nextDueDate, // Needs Loan model update
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