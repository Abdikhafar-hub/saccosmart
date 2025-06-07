const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

router.get('/alerts', systemController.getSystemAlerts);
router.get('/activity', systemController.getSystemActivity);

module.exports = router;
