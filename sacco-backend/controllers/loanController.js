const Loan = require('../models/Loan');
const User = require('../models/User'); // Assuming you need User model here
const Activity = require('../models/Activity'); // Assuming you log activity here

const loanController = {
  // Member: Request a loan (status: pending)
  requestLoan: async (req, res) => {
    const { amount, reason, term } = req.body;
    try {
      const userId = req.user.id;
      const loan = await Loan.create({
        user: userId,
        amount,
        reason,
        term,
        status: 'pending',
        date: new Date(),
        // When requesting, initial balance and disbursed amount could be same as amount
        balance: amount,
        disbursedAmount: amount, // Assuming full amount disbursed on approval
        // Monthly payment and next due date calculated on approval/disbursement
      });
      // Log activity
      const user = await User.findById(userId);
      await Activity.create({
        userName: user?.name || 'Unknown',
        action: 'Applied for loan',
        amount: amount,
        type: 'loan',
      });
      res.json(loan);
    } catch (err) {
      console.error('Loan Request Error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Approve a loan application
  approveLoan: async (req, res) => {
    try {
      const loanId = req.params.id
      const loan = await Loan.findById(loanId).populate('user', 'name email')
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" })
      }

      if (loan.status !== "pending") {
        return res.status(400).json({ message: "Only pending loans can be approved" })
      }

      // Defensive check for term
      const termInMonths = parseInt(loan.term)
      if (isNaN(termInMonths) || termInMonths <= 0) {
        return res.status(400).json({ message: "Loan term is invalid or missing" })
      }

      // Calculate loan details
      const interestRate = 0.12 // 12% annual interest rate
      const monthlyRate = interestRate / 12
      const monthlyPayment = (loan.amount * monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) / 
                            (Math.pow(1 + monthlyRate, termInMonths) - 1)

      // Update loan status and details
      loan.status = "approved"
      loan.interestRate = interestRate
      loan.monthlyPayment = Math.round(monthlyPayment)
      loan.balance = loan.amount
      loan.disbursedAmount = loan.amount
      loan.nextDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      await loan.save()

      // Record activity
      await Activity.create({
        userName: loan.user?.name || 'Unknown',
        action: "Loan Approved",
        type: "loan",
        amount: loan.amount,
        // Optionally add details/status if you want
      })

      res.json({ 
        message: "Loan approved successfully",
        loan: {
          _id: loan._id,
          amount: loan.amount,
          status: loan.status,
          monthlyPayment: loan.monthlyPayment,
          nextDueDate: loan.nextDueDate
        }
      })
    } catch (error) {
      console.error("Error approving loan:", error)
      res.status(500).json({ message: "Error approving loan" })
    }
  },

  // Reject a loan application
  rejectLoan: async (req, res) => {
    try {
      const loanId = req.params.id
      const { reason } = req.body

      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" })
      }

      const loan = await Loan.findById(loanId).populate('user', 'name email')
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" })
      }

      if (loan.status !== "pending") {
        return res.status(400).json({ message: "Only pending loans can be rejected" })
      }

      // Update loan status
      loan.status = "rejected"
      loan.rejectedDate = new Date()
      loan.rejectionReason = reason
      await loan.save()

      // Record activity
      await Activity.create({
        userName: loan.user?.name || 'Unknown',
        action: "Loan Rejected",
        type: "loan",
        amount: loan.amount,
        // Optionally add details/status if you want
      })

      res.json({ 
        message: "Loan rejected successfully",
        loan: {
          _id: loan._id,
          status: loan.status,
          rejectionReason: loan.rejectionReason,
          rejectedDate: loan.rejectedDate
        }
      })
    } catch (error) {
      console.error("Error rejecting loan:", error)
      res.status(500).json({ message: "Error rejecting loan" })
    }
  },

  // Member: Get own loans
  getMemberLoans: async (req, res) => {
    try {
      const userId = req.user.id;
      const loans = await Loan.find({ user: userId }).sort({ date: -1 }); // Sort by date descending

      // Calculate total outstanding amount
      const totalOutstanding = loans.reduce((sum, loan) => {
        if (loan.status === 'active' || loan.status === 'approved') {
          return sum + (loan.balance || 0);
        }
        return sum;
      }, 0);

      // Default loan limit
      const maximumLimit = 100000;

      // Calculate available limit
      const available = Math.max(0, maximumLimit - totalOutstanding);

      // Return both loans and limit data
      res.json({
        loans,
        loanLimit: {
          maximumLimit,
          available,
          used: totalOutstanding,
          basedOn: "Default SACCO Policy"
        }
      });
    } catch (err) {
      console.error('Get Member Loans Error:', err);
      res.status(500).json({ error: 'Failed to fetch member loans' });
    }
  },

  // Get all loans for admin
  getAllLoans: async (req, res) => {
    try {
      const loans = await Loan.find()
        .sort({ date: -1 })
        .select('_id userId userName amount status date term purpose balance disbursedAmount interestRate monthlyPayment nextDueDate completedDate rejectedDate rejectionReason')

      res.json(loans)
    } catch (error) {
      console.error("Error fetching loans:", error)
      res.status(500).json({ message: "Error fetching loans" })
    }
  },

  // Record a loan payment
  recordPayment: async (req, res) => {
    try {
      const { loanId, amount, method } = req.body;
      const userId = req.user.id;

      // Find the loan
      const loan = await Loan.findById(loanId);
      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      // Update loan balance
      loan.balance = (loan.balance || loan.amount) - amount;
      
      // If balance is zero or less, mark loan as completed
      if (loan.balance <= 0) {
        loan.status = 'completed';
        loan.completedDate = new Date();
      }

      await loan.save();

      // Record the payment activity
      const user = await User.findById(userId);
      await Activity.create({
        userId,
        userName: user?.name || 'Unknown',
        action: 'Loan Payment',
        amount,
        type: 'payment',
        details: {
          loanId,
          method,
          status: 'Success'
        },
        date: new Date()
      });

      res.json({
        message: 'Payment recorded successfully',
        loan: {
          _id: loan._id,
          balance: loan.balance,
          status: loan.status
        }
      });
    } catch (err) {
      console.error('Record Payment Error:', err);
      res.status(500).json({ error: 'Failed to record payment' });
    }
  },

  // Get member payment history
  getMemberPaymentHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const activities = await Activity.find({
        userId,
        type: 'payment'
      }).sort({ date: -1 });

      const paymentHistory = activities.map(activity => ({
        date: activity.date,
        loanId: activity.details?.loanId,
        amount: activity.amount,
        type: activity.type,
        status: activity.status,
        method: activity.details?.method || 'Unknown'
      }));

      res.json(paymentHistory);
    } catch (err) {
      console.error('Get Payment History Error:', err);
      res.status(500).json({ error: 'Failed to fetch payment history' });
    }
  }
};

module.exports = loanController;