const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register); // Members only
router.post('/login', authController.login); // Both
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);


module.exports = router;