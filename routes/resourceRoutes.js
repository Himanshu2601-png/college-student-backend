const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', resourceController.getResources);
router.get('/:id', resourceController.getResource);

// Protected routes
router.post('/upload', authMiddleware, upload.single('file'), resourceController.uploadResource);
router.post('/:id/download', authMiddleware, resourceController.downloadResource);
router.get('/user/uploads', authMiddleware, resourceController.getUserResources);
router.delete('/:id', authMiddleware, resourceController.deleteResource);

module.exports = router;
