const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const SupportTicket = require('../models/SupportTicket'); // Adjust model name if needed

// Member routes
router.post('/', auth, role('member'), supportController.createTicket);
router.get('/my', auth, role('member'), supportController.getMyTickets);

// Admin routes
router.get('/', auth, role('admin'), supportController.getAllTickets);
router.post('/:id/respond', auth, role('admin'), supportController.respondTicket);
router.put('/:id/status', auth, role('admin'), supportController.updateStatus);
router.get('/stats', auth, role('admin'), supportController.stats);



module.exports = router;
