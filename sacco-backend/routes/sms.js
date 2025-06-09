const express = require('express');
const router = express.Router();
const { sendBulkSMS } = require('../utils/sendSMS');
const Member = require('../models/Member');
const authenticateToken = require('../middleware/auth');

/**
 * @route POST /api/send-bulk-sms
 * @desc Send bulk SMS to members
 * @access Private (Admin only)
 */
const sendBulkSMSHandler = async (req, res) => {
    try {
        const { message, recipients } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        let phoneNumbers = [];

        // Handle different types of recipients
        if (typeof recipients === 'string') {
            // If recipients is a string (e.g., 'all', 'active', etc.)
            if (recipients === 'all') {
                const members = await Member.find({ status: 'Active' });
                phoneNumbers = members.map(member => member.phone).filter(phone => phone);
            } else if (recipients === 'active') {
                const members = await Member.find({ status: 'Active' });
                phoneNumbers = members.map(member => member.phone).filter(phone => phone);
            } else if (recipients === 'inactive') {
                const members = await Member.find({ status: 'Inactive' });
                phoneNumbers = members.map(member => member.phone).filter(phone => phone);
            } else if (recipients === 'pending') {
                const members = await Member.find({ status: 'Pending' });
                phoneNumbers = members.map(member => member.phone).filter(phone => phone);
            }
        } else if (Array.isArray(recipients)) {
            // If recipients is an array of phone numbers
            phoneNumbers = recipients.filter(phone => phone);
        }

        if (phoneNumbers.length === 0) {
            return res.status(400).json({ message: 'No valid phone numbers found' });
        }

        // Send SMS
        const response = await sendBulkSMS(phoneNumbers, message);

        res.json({
            success: true,
            message: 'SMS sent successfully',
            data: response
        });
    } catch (error) {
        console.error('Error in send-bulk-sms:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send SMS',
            error: error.message
        });
    }
};

// Register the route with the handler function
router.post('/send-bulk-sms', authenticateToken, sendBulkSMSHandler);

module.exports = router; 