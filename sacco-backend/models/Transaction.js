const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['contribution', 'loan', 'payment'] },
  amount: Number,
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Transaction', TransactionSchema);