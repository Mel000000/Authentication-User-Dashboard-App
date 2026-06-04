const { v2: cloudinary } = require('cloudinary');
const dotenv = require('dotenv');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Load .env file

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper to delete an image by public ID
const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

const uploadImageToCloudinary = async (fileBuffer, fileType) => {
  try {
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${fileType};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'user_profiles',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return result;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};



module.exports = { cloudinary, deleteImageFromCloudinary, uploadImageToCloudinary };