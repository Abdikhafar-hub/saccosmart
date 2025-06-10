const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const sendEmail = require('../utils/sendEmail.js');




// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports/');
  },
  filename: function (req, file, cb) {
    cb(null, `report-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// Get all reports
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get report stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const monthlyReports = await Report.countDocuments({
      createdAt: { 
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });
    const scheduledReports = await Report.countDocuments({ status: 'Processing' });
    const downloads = await Report.countDocuments({ status: 'Generated' });

    res.json({
      totalReports,
      monthlyReports,
      scheduledReports,
      downloads
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new report
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const report = new Report({
      name: req.body.name,
      type: req.body.type,
      format: req.body.format,
      status: 'Generated',
      filePath: req.file ? req.file.path : null,
      fileSize: req.file ? req.file.size : null,
      generatedBy: req.user._id,
      parameters: {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        recipients: req.body.recipients ? req.body.recipients.split(',') : []
      }
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific report
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'name email');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download a report
router.get('/:id/download', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report || !report.filePath) {
      return res.status(404).json({ message: 'Report file not found' });
    }
    res.download(report.filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Email a report
router.post('/:id/email', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report || !report.filePath) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const { recipients } = req.body;
    if (!recipients) {
      return res.status(400).json({ message: 'Recipients are required' });
    }

    // Send email with report attachment
    const emailData = {
      to: recipients,
      subject: `SaccoSmart Report: ${report.name}`,
      text: `Please find attached the ${report.type} report you requested.`,
      attachments: [{
        filename: path.basename(report.filePath),
        path: report.filePath
      }]
    };

    // Use your email service to send the email
    // This is a placeholder - implement according to your email service
    await sendEmail(emailData);

    res.json({ message: 'Report sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 