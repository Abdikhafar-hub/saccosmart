const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const verifyToken = require('../middleware/verifyToken');
const avatarUpload = require('../middleware/avatarUpload');
const cloudinary = require('../config/cloudinary');
const Member = require('../models/Member');
const User = require('../models/User');


router.get('/all', auth, role('admin'), memberController.getAllMembers);


router.get('/loans', auth, role('member'), memberController.getMemberLoanLimit);


router.put('/:id', auth, role('admin'), memberController.updateMember);


router.put('/settings', verifyToken, memberController.updateMemberSettings);


router.get('/:id', auth, memberController.getMemberById);


router.post('/avatar', verifyToken, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'sacco-avatars',
      resource_type: 'auto'
    });

    // Update user's avatar in database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If there's an existing avatar, delete it from Cloudinary
    if (user.avatar) {
      const publicId = user.avatar.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    user.avatar = result.secure_url;
    await user.save();

    res.json({ 
      message: 'Avatar uploaded successfully',
      avatar: result.secure_url
    });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});


module.exports = router;
