const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/sendEmail');
const authenticateToken = require('../middleware/auth');

/**
 * Send an email to a recipient
 * POST /api/send-email
 */
router.post('/send-email', authenticateToken, async (req, res) => {
    try {
        const { to, subject, message } = req.body;

        // Validate request body
        if (!to || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'To, subject, and message are required'
            });
        }

        // Send email
        await sendEmail(to, subject, message);

        res.json({
            success: true,
            message: 'Email sent successfully'
        });
    } catch (error) {
        console.error('Error in send-email route:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send email'
        });
    }
});

module.exports = router; 