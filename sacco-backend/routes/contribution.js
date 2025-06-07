const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Allow both members and admins to create contributions
router.post('/', auth, role(['member', 'admin']), contributionController.createContribution);

// Member fetches their contributions
router.get('/', auth, role('member'), contributionController.getMemberContributions);

// Admin fetches all contributions
router.get('/all', auth, role('admin'), contributionController.getAllContributions);

// Admin approves/rejects
router.put('/approve/:id', auth, role('admin'), contributionController.approveContribution);
router.put('/reject/:id', auth, role('admin'), contributionController.rejectContribution);

module.exports = router;