const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash('40141482aB', 10);
  const admin = await User.findOneAndUpdate(
    { email: 'admin@saccosmart.com' },
    { name: 'Admin', password: hash, role: 'admin', memberCode: 'ADMIN001' },
    { upsert: true, new: true }
  );
  console.log('Admin user ensured:', admin.email);
  mongoose.disconnect();
}
seedAdmin();