const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'active', 'completed', 'defaulted', 'overdue'], 
    default: 'pending' 
  },
  date: { type: Date, default: Date.now },
  term: { type: String },
  reason: { type: String },
  balance: { type: Number },
  disbursedAmount: { type: Number },
  interestRate: { type: Number },
  monthlyPayment: { type: Number },
  nextDueDate: { type: Date },
  completedDate: { type: Date },
  rejectedDate: { type: Date },
  rejectionReason: { type: String },
  purpose: { type: String },
});

module.exports = mongoose.model('Loan', loanSchema);