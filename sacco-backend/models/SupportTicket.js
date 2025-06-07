const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String }, // for member form
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
  status: { type: String, enum: ['open', 'in progress', 'resolved'], default: 'open' },
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    email: String,
    role: String,
  },
  responses: [
    {
      responder: { type: String }, // admin name/email
      message: { type: String },
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
