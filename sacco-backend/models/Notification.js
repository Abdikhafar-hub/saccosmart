const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetRole: { type: String, enum: ['all', 'member', 'treasurer', 'admin'], default: 'all' },
  sentBy: { type: String, required: true },
  recipients: { type: Number, default: 0 },
  status: { type: String, enum: ['Sent', 'Draft', 'Scheduled'], default: 'Sent' },
  sentAt: { type: Date, default: Date.now },
  scheduledFor: { type: Date }, // optional, for scheduled notifications
  targetMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
})

module.exports = mongoose.model('Notification', notificationSchema)
