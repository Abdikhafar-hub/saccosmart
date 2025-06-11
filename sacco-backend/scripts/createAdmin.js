const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@saccosmart.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const hash = await bcrypt.hash('40141482aB', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@saccosmart.com',
      password: hash,
      role: 'admin',
      memberCode: 'ADMIN001',
      status: 'active',
      isVerified: true
    });

    console.log('Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the function
createAdmin(); 