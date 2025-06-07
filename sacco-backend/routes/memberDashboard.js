const express = require('express')
const router = express.Router()
const memberDashboardController = require('../controllers/memberDashboardController')
const auth = require('../middleware/auth')
const role = require('../middleware/role')

router.get('/full-summary', auth, role('admin'), memberDashboardController.fullSummary)

module.exports = router
