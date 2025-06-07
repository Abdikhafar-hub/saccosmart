const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userName: { type: String, required: true },
  action: { type: String, required: true },
  amount: { type: Number }, // Optional, only for relevant actions
  type: {
    type: String,
    enum: ['contribution', 'loan', 'payment', 'profile', 'other'],
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
