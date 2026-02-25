const Resource = require('../models/Resource');
const path = require('path');
const fs = require('fs');

// Upload resource
exports.uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, subject, description, branch, year, semester } = req.body;
    
    // Get file extension
    const fileExt = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    
    // Create resource
    const resource = new Resource({
      title,
      subject,
      description,
      branch,
      year: parseInt(year),
      semester: parseInt(semester),
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: fileExt,
      fileSize: req.file.size,
      uploadedBy: req.userId
    });

    await resource.save();
    
    // Populate user info before sending response
    await resource.populate('uploadedBy', 'name email');

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource
    });
  } catch (error) {
    // Clean up uploaded file if database save fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading resource' });
  }
};

// Get all resources with filters
exports.getResources = async (req, res) => {
  try {
    const { branch, year, semester, subject, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (branch) filter.branch = branch;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (subject) filter.subject = new RegExp(subject, 'i');
    
    // Add text search if provided
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Fetch resources with filters
    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name email')
      .sort('-createdAt');

    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Error fetching resources' });
  }
};

// Get single resource
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name email');
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Error fetching resource' });
  }
};

// Download resource (increment download count)
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    res.json({ 
      message: 'Download recorded',
      fileUrl: resource.fileUrl,
      fileName: resource.fileName
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error processing download' });
  }
};

// Get user's uploaded resources
exports.getUserResources = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.userId })
      .sort('-createdAt');
    
    res.json(resources);
  } catch (error) {
    console.error('Get user resources error:', error);
    res.status(500).json({ message: 'Error fetching user resources' });
  }
};

// Delete resource (only by uploader)
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      uploadedBy: req.userId
    });
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found or unauthorized' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', resource.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await resource.deleteOne();

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Error deleting resource' });
  }
};
