require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => console.log('🎉 MongoDB connected successfully '))
.catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` 📡 Server running on port ${PORT}`));