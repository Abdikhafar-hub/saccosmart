const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  format: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Generated', 'Failed', 'Processing'],
    default: 'Processing'
  },
  filePath: { type: String },
  fileSize: { type: Number },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parameters: {
    startDate: { type: Date },
    endDate: { type: Date },
    recipients: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema); 