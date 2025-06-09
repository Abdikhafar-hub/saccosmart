const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


router.get('/all', auth, role('admin'), memberController.getAllMembers);


router.get('/loans', auth, role('member'), memberController.getMemberLoanLimit);


router.put('/:id', auth, role('admin'), memberController.updateMember);


router.put('/settings', verifyToken, memberController.updateMemberSettings);


router.get('/:id', auth, memberController.getMemberById);


router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    // Handle the file and update the user's avatar URL in the database
    res.send({ message: 'Avatar uploaded successfully.' });
  } catch (err) {
    res.status(500).send('Server error.');
  }
});


module.exports = router;
