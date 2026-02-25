const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|ppt|pptx|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
                  file.mimetype === 'application/pdf' ||
                  file.mimetype === 'application/msword' ||
                  file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                  file.mimetype === 'application/vnd.ms-powerpoint' ||
                  file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, PPT, and DOCX files are allowed'));
  }
};

// Upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
