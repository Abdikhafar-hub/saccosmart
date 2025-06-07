const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Use Gmail service
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('Transporter verification error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

// POST endpoint to handle contact form submissions
router.post('/', async (req, res) => {
  try {
    console.log('Received contact form submission:', req.body);
    const { fullName, emailAddress, phoneNumber, message } = req.body;

    // Validate request body
    if (!fullName || !emailAddress || !message) {
      console.log('Validation failed:', { fullName, emailAddress, message });
      return res.status(400).json({ error: 'Full name, email, and message are required' });
    }

    // Email options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_FORM_RECIPIENT,
      subject: `New Contact Form Submission from ${fullName}`,
      text: `
        Name: ${fullName}
        Email: ${emailAddress}
        Phone: ${phoneNumber || 'Not provided'}
        Message: ${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${emailAddress}</p>
        <p><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    console.log('Attempting to send email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    res.status(200).json({ message: 'Email sent successfully, Our team will get back to you shortly' });
  } catch (error) {
    console.error('Detailed error sending email:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

module.exports = router; 