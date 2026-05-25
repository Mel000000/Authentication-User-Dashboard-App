// server/routes/profileImage.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const User = require('../models/user');
const auth = require('../middleware/auth');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Use memory storage (no CloudinaryStorage needed)
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'), false);
  }
};

// Configure multer
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload profile image
router.post('/upload-profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old image from Cloudinary if it exists
    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
    }

    // Convert buffer to base64 and upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'user_profiles',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    // Update user with new image
    user.profileImageUrl = result.secure_url;
    user.profileImagePublicId = result.public_id;
    await user.save();

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      profileImageUrl: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// Delete profile image
router.delete('/delete-profile-image', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete from Cloudinary if exists
    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
        console.log('Image deleted:', user.profileImagePublicId);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    // Reset to default avatar (UI Avatars)
    const defaultAvatarUrl = `https://ui-avatars.com/api/?background=667eea&color=fff&rounded=true&size=150&bold=true&name=${encodeURIComponent(user.username)}`;
    
    user.profileImageUrl = defaultAvatarUrl;
    user.profileImagePublicId = null;
    await user.save();

    res.status(200).json({
      message: 'Profile image deleted successfully',
      profileImageUrl: defaultAvatarUrl
    });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ error: 'Failed to delete profile image' });
  }
});

module.exports = router;