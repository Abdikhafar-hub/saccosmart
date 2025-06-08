const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  createdAt: { type: Date, default: Date.now },
  password: String,
  memberCode: { type: String, required: true, unique: true },
  membershipType: String,
  joinDate: Date,
  dateOfBirth: Date,
  currentBalance: Number,
  loanBalance: Number,
  otp: String,
  otpExpiresAt: Date,
  isVerified: { type: Boolean, default: false },
  otpResendCount: { type: Number, default: 0 },
  lastOtpSentAt: Date,
  firstName: { type: String },
  lastName: { type: String },
});

module.exports = mongoose.model('User', userSchema);