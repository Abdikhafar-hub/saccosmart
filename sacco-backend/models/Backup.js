const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  // Optionally, add more fields (e.g., backup file path, status, etc.)
});

module.exports = mongoose.model('Backup', backupSchema);
