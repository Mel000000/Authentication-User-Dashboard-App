// server/routes/profileImage.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const User = require('../models/user');
const { authTemp, auth } = require('../middleware/auth.js');
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require('../config/cloudinary');
const path = require('path');

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

router.post("/upload-profile-image-temporary-user", authTemp,upload.single('profileImage'), async (req, res) => {
  try{
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const {email} = req.body;
    if(!email){
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if(!user){
      return res.status(404).json({ error: 'User not found' });
    }
      const result = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype);

      user.profileImageUrl = result.secure_url;
      user.profileImagePublicId = result.public_id;
      await user.save();

      res.status(200).json({
        message: 'Profile image uploaded successfully',
        profileImageUrl: result.secure_url
      });

  }catch(error){
    console.error("Error adding profile image to cookie:", error);
    res.status(500).json({ error: "Failed to add profile image to cookie" });
  }
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
        await deleteImageFromCloudinary(user.profileImagePublicId);
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
    }

    
    const result = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype);

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
router.delete('/delete-profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete from Cloudinary if exists
    if (user.profileImagePublicId) {
      try {
        await deleteImageFromCloudinary(user.profileImagePublicId);
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