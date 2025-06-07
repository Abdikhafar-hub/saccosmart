const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes require admin authentication
router.post('/', auth, role('admin'), upload.single('file'), documentController.create);
router.get('/', auth, role('admin'), documentController.list);
router.get('/stats', auth, role('admin'), documentController.stats);
router.put('/:id', auth, role('admin'), documentController.update);
router.delete('/:id', auth, role('admin'), documentController.remove);

// Admin endpoints
router.get('/types', auth, role('admin'), documentController.getDocumentTypes);
router.get('/', auth, role('admin'), documentController.getAllDocuments);
router.post('/', auth, role('admin'), upload.single('file'), documentController.uploadDocument);

// Member endpoint
router.get('/member', auth, role('member'), documentController.getPublicDocuments);

module.exports = router;
