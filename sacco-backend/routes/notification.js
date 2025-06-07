const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notificationController')
const auth = require('../middleware/auth')
const role = require('../middleware/role')

// Admin endpoints
router.get('/summary', auth, role('admin'), notificationController.getSummary)
router.get('/', auth, role('admin'), notificationController.getAll)
router.post('/', auth, role('admin'), notificationController.create)
router.delete('/:id', auth, role('admin'), notificationController.delete)
router.put('/:id', auth, role('admin'), notificationController.update)

// Member endpoint
router.get('/member', auth, role('member'), notificationController.getForMembers)

module.exports = router