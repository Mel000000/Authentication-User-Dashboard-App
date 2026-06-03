const mongoose = require("mongoose");
const User = require("../../server/models/user");
const { deleteImageFromCloudinary } = require("../../server/config/cloudinary.js");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Load .env file

const uri = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(uri, {dbName: "Authentication-User-Dashboard-App"  });
    console.log("Successfully connected to MongoDB via Mongoose!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Stop the server if database connection fails
  }
}

connectDB();

const fetchUsersWithUnverifiedEmailsAndDelete = async () =>{
  const users = await User.find()
  for (const user of users) {
    if (!user.email_verified) {
      try {
        if (user.profileImagePublicId) {
          try {
            await deleteImageFromCloudinary(user.profileImagePublicId);
            console.log(`Deleted profile image for user with unverified email: ${user.email}`);
          } catch (cloudinaryError) {
            console.error("Error deleting profile image from Cloudinary:", cloudinaryError);
          }
        }
        await User.deleteOne({ _id: user._id });
        console.log(`Deleted user with unverified email: ${user.email}`);

      } catch (err) {
        console.error(`Error deleting user ${user.email}:`, err);
      }
    }
  }console.log("Finished checking for unverified emails and deleting users.");
  mongoose.connection.close(); // Close the connection after the operation is complete
};


fetchUsersWithUnverifiedEmailsAndDelete ();
