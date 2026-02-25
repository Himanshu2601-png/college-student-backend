const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: 100
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxLength: 50
  },
  description: {
    type: String,
    maxLength: 500
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Other']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'ppt', 'pptx', 'doc', 'docx']
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search functionality
resourceSchema.index({ title: 'text', subject: 'text', description: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
