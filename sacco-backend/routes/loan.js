const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const auth = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Member routes
router.get('/', auth, roleMiddleware(['member']), loanController.getMemberLoans);
router.post('/request', auth, roleMiddleware(['member']), loanController.requestLoan);
router.get('/payments', auth, roleMiddleware(['member']), loanController.getMemberPaymentHistory);
router.post('/payments', auth, roleMiddleware(['member']), loanController.recordPayment);

// Admin routes
router.get('/admin', auth, roleMiddleware(['admin']), loanController.getAllLoans);
router.post('/admin/:id/approve', auth, roleMiddleware(['admin']), loanController.approveLoan);
router.post('/admin/:id/reject', auth, roleMiddleware(['admin']), loanController.rejectLoan);

module.exports = router;