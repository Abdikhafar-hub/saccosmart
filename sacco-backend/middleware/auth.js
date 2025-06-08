const jwt = require('jsonwebtoken');
const User = require('../models/User'); // make sure the path is correct
require('dotenv').config();

module.exports = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("email name role");
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // now contains user.email, user.name, etc.
    next();
  } catch (err) {
    console.error("JWT Middleware Error:", err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
