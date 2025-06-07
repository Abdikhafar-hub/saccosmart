const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { sendSMS } = require('../utils/sendSMS');
const crypto = require('crypto');

// Member Registration
exports.register = async (req, res) => {
  const { name, email, password, phone, role, memberCode } = req.body;
  if (email === 'admin@saccosmart.com') {
    return res.status(403).json({ message: 'Cannot register as admin' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({ message: 'User already registered and verified' });
      } else {
        // Update OTP and resend
        existingUser.otp = crypto.randomInt(100000, 999999).toString();
        existingUser.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await existingUser.save();
        await sendSMS(phone, `Your OTP is ${existingUser.otp}`);
        return res.json({ message: 'OTP resent. Please verify your phone number.' });
      }
    }

    const hash = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const user = await User.create({
      name,
      email,
      password: hash,
      phone,
      role,
      memberCode,
      otp,
      otpExpiresAt,
      isVerified: false
    });
    await sendSMS(phone, `Your OTP is ${otp}`);
    res.json({ message: 'Registration successful. OTP sent to your phone.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone });
  if (!user) return res.status(400).json({ message: 'User not found' });
  if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  if (user.otpExpiresAt < Date.now()) return res.status(400).json({ message: 'OTP expired' });
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();
  res.json({ message: 'Phone number verified successfully' });
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  const { phone } = req.body;
  const user = await User.findOne({ phone });
  if (!user) return res.status(400).json({ message: 'User not found' });
  if (user.otpResendCount >= 3 && user.lastOtpSentAt > Date.now() - 15 * 60 * 1000) {
    return res.status(429).json({ message: 'Too many OTP requests. Please try again later.' });
  }
  const otp = crypto.randomInt(100000, 999999).toString();
  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  user.otpResendCount += 1;
  user.lastOtpSentAt = new Date();
  await user.save();
  await sendSMS(phone, `Your new OTP is ${otp}`);
  res.json({ message: 'OTP resent successfully' });
};

// Login (Admin or Member)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Please verify your phone number before logging in.' });
  }

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