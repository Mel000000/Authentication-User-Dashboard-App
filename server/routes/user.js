const express = require("express");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { UserSchema } = require("../models/userZSchema");
const {auth} = require("../middleware/auth");
const { deleteImageFromCloudinary } = require("../config/cloudinary");
const { doubleCsrfProtection, generateToken } = require("../middleware/csrf");

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === "test";
const isDeployed = isProduction || isTest; // both need Secure+SameSite=None (cross-origin HTTPS on Render)

const router = express.Router();


// Helper function to verify CAPTCHA token with Google's API
async function verifyCaptcha(token) {
  if (!token || typeof token !== 'string' || token.length < 20) {
    return false;
  }
  if (isTest){
    return true;
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
      console.error("CAPTCHA failed with errors:", response.data['error-codes']);
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
      secure: isDeployed,
      sameSite: isDeployed ? 'none' : 'lax'
    });
    req.session.destroy();
    res.json({ message: "Logged out successfully" });
  }
);

// Endpoint that recieves user data from the front and stores it for the createUser route to complete the registration after email verification
router.post("/storeRegistrationData", doubleCsrfProtection , async (req, res) => {
  const { email, password, username, country, needCookie } = req.body;

  if (!email || !password || !username || !country) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const validUser = UserSchema.parse({ 
      email, 
      password: hashedPassword, 
      username, country, 
      email_verified: false, 
      profileImageUrl:`https://ui-avatars.com/api/?background=667eea&color=fff&rounded=true&size=150&bold=true&name=${encodeURIComponent(username)}`
    });
    const placeholderUser = new User(validUser);
    await placeholderUser.save();
    // send jwt token with the email as payload so we can identify the user in the createUser route after email verification, this token will be stored in a cookie and then deleted after we get the email from it in the createUser route
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    if (needCookie) {
      res.cookie("tempEmail", token, {
        httpOnly: true,
        secure: isDeployed,
        sameSite: isDeployed ? "none" : "lax",
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
    }
    res.json({ message: "Registration data stored successfully" });
  } catch (err) {
    console.error("Error storing registration data:", err);
    res.status(500).json({ error: "Internal server error" });
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
      return res.status(401).json({ error: "Invalid credentials" });
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
      secure: isDeployed,
      sameSite: isDeployed ? "none" : "lax",
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
    const { username, country} = req.body;
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const validUser = UserSchema.parse({ 
      email: user.email,
      password: user.password,
      username : username ? username : user.username, 
      country: country ? country : user.country, 
    });

    if (!validUser){
      return res.status(400).json({ error: "Invalid data"})
    }

    user.username = username || user.username;
    user.country = country || user.country;

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

router.get('/auth/status', (req, res) => {
  const token = req.cookies.token;
  const isValidToken = (token) => {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return true;
    } catch (err) {
      return false;
    }
  };
  if (token && isValidToken(token)) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;