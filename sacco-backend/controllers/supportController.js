const SupportTicket = require('../models/SupportTicket');

// Member: Submit a ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, title, description, category, priority } = req.body;
    const user = req.user;
    const ticket = await SupportTicket.create({
      subject,
      title: title || subject,
      description,
      category: category?.toLowerCase(),
      priority: priority?.toLowerCase(),
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Member: Get own tickets
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ "user._id": req.user.id }).sort('-createdAt');
    res.json(tickets);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Get all tickets (with optional filters)
exports.getAllTickets = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { "user.name": { $regex: search, $options: 'i' } },
      { "user.email": { $regex: search, $options: 'i' } }
    ];
    const tickets = await SupportTicket.find(filter).sort('-createdAt');
    res.json(tickets);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Respond to a ticket
exports.respondTicket = async (req, res) => {
  try {
    const { message } = req.body;
    const responder = req.user.name || req.user.email;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { $push: { responses: { responder, message } }, status: "In Progress" },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Update ticket status (e.g., mark as resolved)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Ticket stats
exports.stats = async (req, res) => {
  try {
    const total = await SupportTicket.countDocuments();
    const open = await SupportTicket.countDocuments({ status: "Open" });
    const inProgress = await SupportTicket.countDocuments({ status: "In Progress" });
    const resolved = await SupportTicket.countDocuments({ status: "Resolved" });
    res.json({ total, open, inProgress, resolved });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};