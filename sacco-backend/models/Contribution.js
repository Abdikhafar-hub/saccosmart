const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String },
  mpesaCode: { type: String },
  bankRef: { type: String },
  reference: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Verified', 'Rejected', 'success'], // Add 'success' here
    default: 'Pending' 
  },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  rejectedBy: { type: String },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contribution', contributionSchema);
