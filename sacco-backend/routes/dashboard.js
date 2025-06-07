const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/member', auth, role('member'), dashboardController.memberDashboard);
router.get('/admin', auth, role('admin'), dashboardController.getAdminDashboard);

module.exports = router;