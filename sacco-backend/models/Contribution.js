const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, default: 'Paystack' },
  mpesaCode: { type: String },
  bankRef: { type: String },
  reference: { type: String, required: true, unique: true },
  status: { type: String, enum: ['success', 'failed'], default: 'failed' },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  rejectedBy: { type: String },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contribution', contributionSchema);