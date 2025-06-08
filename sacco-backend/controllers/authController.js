const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Member Registration
exports.register = async (req, res) => {
  const { name, email, password, phone, role, memberCode } = req.body;
  if (email === 'admin@saccosmart.com') {
    return res.status(403).json({ message: 'Cannot register as admin' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Account already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      phone,
      role,
      memberCode
    });
    res.json({ message: 'Registration successful. You can now log in.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove OTP verification logic
exports.verifyOtp = async (req, res) => {
  res.status(400).json({ message: 'OTP verification is not required.' });
};

// Login (Admin or Member)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

// Request password reset
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "No user with that email" });

  // Generate a reset token (JWT, expires in 15min)
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

  // Send email (use your real SMTP config in production)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: user.email,
    subject: "SaccoSmart Password Reset",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
  });

  res.json({ message: "Password reset email sent" });
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hash });
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};