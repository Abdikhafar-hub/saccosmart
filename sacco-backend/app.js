require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Detailed request logging middleware
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  next();
});

// Test route to verify server is running
app.get('/', (req, res) => {
  res.json({ message: 'SaccoSmart USSD server is running' });
});

// USSD route - register this first
app.use('/ussd', require('./routes/ussd'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🎉 MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contribution', require('./routes/contribution'));
app.use('/api/loan', require('./routes/loan'));
app.use('/api/user', require('./routes/user'));
const documentRoutes = require('./routes/document');
app.use('/api/documents', documentRoutes);
app.use('/api/support', require('./routes/support'));
const memberRoutes = require('./routes/member');
app.use('/api/member', memberRoutes);
const memberDashboardRoutes = require('./routes/memberDashboard')
app.use('/api/dashboard/members', memberDashboardRoutes)
const notificationRoutes = require('./routes/notification')
app.use('/api/notifications', notificationRoutes)
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const systemRoutes = require('./routes/system');
const adminRoutes = require('./routes/admin');
const whatsappRoutes = require('./routes/whatsapp');
const contactRoutes = require('./routes/contact');
const aiRoutes = require('./routes/ai');
const smsRoutes = require('./routes/sms');
const emailRoutes = require('./routes/email');
const reportRoutes = require('./routes/reports');

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api', emailRoutes);
app.use('/api/reports', reportRoutes);

app.use('/api/payments', require('./routes/mpesaPayments'));
app.use('/api/card', require('./routes/cardPayments'));

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Attach the Socket.IO instance to the app
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  if (req.path.startsWith('/ussd')) {
    res.status(500).send('END An error occurred. Please try again later.');
  } else {
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  if (req.path.startsWith('/ussd')) {
    res.status(404).send('END Invalid USSD request');
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` 📡 Server running on port ${PORT}`));