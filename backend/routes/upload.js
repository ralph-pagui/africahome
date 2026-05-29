const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { protect } = require('../middleware/auth');

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Images et vidéos uniquement.'), false);
    }
  }
});

// Helper: upload buffer to cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

// @route   POST /api/upload
// @desc    Upload images/videos to Cloudinary
router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }

    const urls = [];
    for (const file of req.files) {
      const isVideo = file.mimetype.startsWith('video/');
      const result = await uploadToCloudinary(file.buffer, {
        folder: 'africahome',
        resource_type: isVideo ? 'video' : 'image',
        transformation: isVideo ? undefined : [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });
      urls.push(result.secure_url);
    }

    res.json({ success: true, urls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/upload
// @desc    Delete file from Cloudinary
router.delete('/', protect, async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ success: false, message: 'publicId requis' });
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'Fichier supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
