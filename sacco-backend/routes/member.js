const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Add this route for admin to get all members
router.get('/all', auth, role('admin'), memberController.getAllMembers);

// Add this route for members to get their loan limit data
router.get('/loans', auth, role('member'), memberController.getMemberLoanLimit);

// Add this route for updating member details
router.put('/:id', auth, role('admin'), memberController.updateMember);

module.exports = router;
