const express = require('express');
const router = express.Router();
const { handleUSSD } = require('../controllers/ussdController');

// Log all USSD requests
router.use((req, res, next) => {
  console.log('=== USSD Route Debug ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// USSD endpoint
router.post('/', (req, res, next) => {
  try {
    handleUSSD(req, res);
  } catch (error) {
    console.error('USSD Error:', error);
    res.status(500).send('END An error occurred. Please try again later.');
  }
});

// Handle 404 for USSD routes
router.use((req, res) => {
  console.log('USSD 404:', req.method, req.url);
  res.status(404).send('END Invalid USSD request');
});

module.exports = router; 