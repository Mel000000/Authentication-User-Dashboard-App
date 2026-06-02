const express = require("express");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const User = require("../models/user");
const { createUserSchema } = require("../models/userZSchema");
const auth = require("../middleware/auth");
const { deleteImageFromCloudinary } = require("../config/cloudinary");
const { doubleCsrfProtection, generateToken } = require("../middleware/csrf");
const isProduction = process.env.NODE_ENV === 'production';

const router = express.Router();

router.use(helmet());

// Helper function to verify CAPTCHA token with Google's API
async function verifyCaptcha(token) {
  if (!token || typeof token !== 'string' || token.length < 20) {
    return false;
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.CAPTCHA_SECRET,
          response: token
        },
        timeout: 10000
      }
    );

    if (response.data.success === true) {
      return true;
    } else {
      console.log("CAPTCHA failed with errors:", response.data['error-codes']);
      return false;
    }
  } catch (error) {
    console.error("CAPTCHA verification error:", error.message);
    return false;
  }
}

router.get("/csrf-token", async (req, res) => {
  try {
    // Force session to be created and saved
    if (!req.session.csrfInit) {
      req.session.csrfInit = true;
      await new Promise((resolve, reject) => {
        req.session.save(err => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Now clear old CSRF cookies and generate new token
    res.clearCookie("X-CSRF-Token");
    res.clearCookie("__Host-csrf");
    res.clearCookie("csrf-token");

    const token = generateToken(req, res, true);
    res.json({ csrfToken: token });
  } catch (err) {
    console.error("CSRF token generation error:", err);
    res.status(500).json({ error: "Could not generate CSRF token" });
  }
});

// Get current user (protected route)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Auth error inside /me route:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Logout endpoint
router.post("/logout",doubleCsrfProtection,(req, res) => {                     
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.json({ message: "Logged out successfully" });
  }
);

// Endpoint that recieves user data from the front and stores it for the createUser route to complete the registration after email verification
router.post("/storeRegistrationData", doubleCsrfProtection , async (req, res) => {
  const { email, password, username, country } = req.body;
  if (!email || !password || !username || !country) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const placeholderUser = new User({
      email,
      password: hashedPassword,
      username,
      country,
      email_verified: false,
      profileImageUrl: `https://ui-avatars.com/api/?background=667eea&color=fff&rounded=true&size=150&bold=true&name=${encodeURIComponent(username)}`,
    });
    await placeholderUser.save();
    res.json({ message: "Registration data stored successfully" });
  } catch (err) {
    console.error("Error storing registration data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to create / complete a new user after email verification
router.post("/createUser",doubleCsrfProtection,async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    console.log("Zod validation failed:", parsed.error.errors);
    return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
  }

  try {
    const existingUser = await User.findOne({ email: parsed.data.email });

    // FIX: block only if a *verified* user already exists
    if (existingUser && existingUser.email_verified && existingUser.password) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    const imageUrl = `https://ui-avatars.com/api/?background=667eea&color=fff&rounded=true&size=150&bold=true&name=${encodeURIComponent(parsed.data.username)}`;

    let user;
    if (existingUser) {
      // FIX: upsert — fill in the placeholder row created during code-send
      existingUser.password = hashedPassword;
      existingUser.username = parsed.data.username;
      existingUser.country = parsed.data.country;
      existingUser.profileImageUrl = imageUrl;
      existingUser.profileImagePublicId = null;
      // email_verified was already set to true by the verifyCode route
      user = existingUser;
    } else {
      // Fallback: create fresh (e.g. if placeholder was somehow lost)
      user = new User({
        email: parsed.data.email,
        email_verified: true,
        password: hashedPassword,
        username: parsed.data.username,
        country: parsed.data.country,
        profileImageUrl: imageUrl,
        profileImagePublicId: null,
      });
    }

    await user.save();

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const userResponse = {
      id: user._id,
      email: user.email,
      username: user.username,
      country: user.country,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: "User created successfully",
      token: jwtToken,
      user: userResponse
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Login endpoint
router.post("/loginUser", doubleCsrfProtection, async (req, res) => {
  const { email, password, token: captchaToken } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const isCaptchaValid = await verifyCaptcha(captchaToken);
  if (!isCaptchaValid) {
    return res.status(400).json({ error: "CAPTCHA verification failed" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.email_verified) {
      return res.status(403).json({ error: "Please verify your email before logging in" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = {
      userId: user._id,
      email: user.email,
      username: user.username
    };

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const userResponse = {
      id: user._id,
      email: user.email,
      username: user.username,
      country: user.country,
      email_verified: user.email_verified
    };

    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      user: userResponse
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ error: "Failed to login user" });
  }
});

// Delete user account endpoint
router.delete("/delete", doubleCsrfProtection, auth, async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    // FIX: only allow deletion if the authenticated user's email matches the email to delete
    if (req.user.email !== email) {
      return res.status(403).json({ error: "You can only delete your own account" });
    }

    const userToDelete = await User.findOne({ email });
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToDelete.profileImagePublicId) {
      try {
        await deleteImageFromCloudinary(userToDelete.profileImagePublicId);
      } catch (cloudinaryError) {
        console.error("Error deleting profile image from Cloudinary:", cloudinaryError);
      }
    }

    await User.deleteOne({ _id: userToDelete._id });

    return res.status(200).json({ message: "User account deleted successfully" });
  } catch (err) {
    console.error("Error deleting user account:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to delete user account" });
    }
  }
});

// Update user profile endpoint
router.put("/updateProfile", doubleCsrfProtection, auth, async (req, res) => {
  try {
    const { username, country, email } = req.body;
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.username = username || user.username;
    user.country = country || user.country;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Get logged-in user info (protected route)
router.get("/loggedIn", auth, async (req, res) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching logged-in user:", err);
    res.status(500).json({ error: "Failed to fetch logged-in user" });
  }
});

module.exports = router;