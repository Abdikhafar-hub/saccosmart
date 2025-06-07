const Notification = require('../models/Notification')

// GET /api/notifications/summary
exports.getSummary = async (req, res) => {
  const now = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const totalSent = await Notification.countDocuments({ status: 'Sent' })
  const draftCount = await Notification.countDocuments({ status: 'Draft' })
  const totalRecipients = await Notification.aggregate([
    { $group: { _id: null, total: { $sum: "$recipients" } } }
  ])
  const thisMonth = await Notification.countDocuments({
    status: 'Sent',
    sentAt: {
      $gte: new Date(`${monthStr}-01T00:00:00.000Z`),
      $lt: new Date(`${monthStr}-31T23:59:59.999Z`)
    }
  })

  res.json({
    totalSent,
    draftCount,
    totalRecipients: totalRecipients[0]?.total || 0,
    thisMonth
  })
}

// GET /api/notifications
exports.getAll = async (req, res) => {
  const notifications = await Notification.find().sort({ sentAt: -1 })
  res.json(notifications)
}

// POST /api/notifications
exports.create = async (req, res) => {
  const { title, message, target, targetMemberId, status = "Sent", scheduledFor } = req.body
  let targetRole = target
  let notificationData = {
    title,
    message,
    targetRole,
    sentBy: req.user?.name || "Admin User",
    recipients: 0,
    status,
    sentAt: status === "Sent" ? new Date() : undefined,
    scheduledFor: status === "Scheduled" ? scheduledFor : undefined,
  }
  if (target === "member" && targetMemberId) {
    notificationData.targetMemberId = targetMemberId
    notificationData.targetRole = "member"
  }
  const notification = new Notification(notificationData)
  await notification.save()
  res.status(201).json(notification)
}

// GET /api/member/notifications
exports.getForMembers = async (req, res) => {
  const userId = req.user.id
  const notifications = await Notification.find({
    status: 'Sent',
    $or: [
      { targetRole: 'all' },
      { targetRole: 'member', targetMemberId: null },
      { targetRole: 'member', targetMemberId: userId },
    ]
  }).sort({ sentAt: -1 })
  res.json(notifications)
}

// DELETE /api/notifications/:id
exports.delete = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id)
    if (!notification) return res.status(404).json({ error: 'Notification not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/notifications/:id
exports.update = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!notification) return res.status(404).json({ error: 'Notification not found' })
    res.json(notification)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
