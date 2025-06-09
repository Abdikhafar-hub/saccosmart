const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // false for TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
    }
});

/**
 * Send an email to a single recipient
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} message - Email message content
 * @returns {Promise} - Promise resolving to the send result
 */
const sendEmail = async (to, subject, message) => {
    try {
        // Validate inputs
        if (!to || !subject || !message) {
            throw new Error('To, subject, and message are required');
        }

        // Email options
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: to,
            subject: subject,
            text: message,
            html: message // You can also send HTML content
        };

        console.log('Sending email to:', to);
        
        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendEmail
}; 