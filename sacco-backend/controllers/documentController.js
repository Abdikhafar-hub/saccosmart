const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

// Create (Upload)
exports.create = async (req, res) => {
  try {
    const { title, type, status } = req.body;
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    const doc = await Document.create({
      title,
      type,
      status,
      filePath: req.file.path,
      fileSize: req.file.size,
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read (List with filters, pagination, sorting)
exports.list = async (req, res) => {
  try {
    const { title, type, status, limit = 20, skip = 0, sort = '-createdAt' } = req.query;
    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (type) filter.type = type;
    if (status) filter.status = status;
    const docs = await Document.find(filter)
      .sort(sort)
      .skip(Number(skip))
      .limit(Number(limit));
    res.json(docs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Stats
exports.stats = async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments();
    const activeDocuments = await Document.countDocuments({ status: 'active' });
    const documentTypes = await Document.distinct('type');
    const storageAgg = await Document.aggregate([
      { $group: { _id: null, total: { $sum: "$fileSize" } } }
    ]);
    const totalStorageUsed = storageAgg[0]?.total || 0;
    res.json({
      totalDocuments,
      activeDocuments,
      documentTypes: documentTypes.length,
      totalStorageUsedMB: (totalStorageUsed / (1024 * 1024)).toFixed(2)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update
exports.update = async (req, res) => {
  try {
    const { title, type, status } = req.body;
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { title, type, status },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.remove = async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    // Delete file from disk
    if (doc.filePath && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' })
    if (!req.body.type) return res.status(400).json({ error: 'Document type is required' })
    if (!req.body.title) return res.status(400).json({ error: 'Title is required' })

    const doc = new Document({
      title: req.body.title,
      type: req.body.type,
      status: req.body.status || 'active',
      filePath: req.file.path,
      fileSize: req.file.size,
    })
    await doc.save()
    res.status(201).json(doc)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Get all document types (dynamic)
exports.getDocumentTypes = async (req, res) => {
  // You can make this dynamic or static as needed
  res.json([
    { value: 'constitution', label: 'SACCO Constitution' },
    { value: 'bylaws', label: 'By-laws' },
    { value: 'policy', label: 'Policy Document' },
    { value: 'procedure', label: 'Procedure Manual' }
  ])
}

// Get all documents (admin)
exports.getAllDocuments = async (req, res) => {
  const docs = await Document.find().sort({ createdAt: -1 })
  res.json(docs)
}

// Get public documents for members
exports.getPublicDocuments = async (req, res) => {
  const docs = await Document.find({ status: 'active' }).sort({ createdAt: -1 })
  res.json(docs)
}
