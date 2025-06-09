const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  nationalId: { type: String, required: true },
  address: { type: String, required: true },
  bio: { type: String },
  nextOfKin: { type: String },
  nextOfKinPhone: { type: String }
});

module.exports = mongoose.model('Member', memberSchema); 