const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date },
  nationalId: { type: String },
  address: { type: String },
  bio: { type: String },
  nextOfKin: { type: String },
  nextOfKinPhone: { type: String },
  role: { 
    type: String, 
    enum: ['member', 'treasurer', 'admin'],
    default: 'member'
  },
  password: { type: String, required: true },
  memberCode: { type: String, unique: true },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
memberSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate member code before saving
memberSchema.pre('save', function(next) {
  if (!this.memberCode) {
    const prefix = this.email.split('@')[0].substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.memberCode = `${prefix}${random}`;
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema); 