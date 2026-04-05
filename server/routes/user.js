const express = require("express");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { createUserSchema } = require("../models/userZSchema");
// const verifyCaptcha = require("../helper/verifyCaptcha");

const router = express.Router();

// Get current user (protected route)
router.get("/me", async (req, res) => {
  const token = req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Endpoint to create a new user
router.post("/createUser", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    console.log("Zod validation failed:", parsed.error.errors);
    return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    }

  try {
    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    const newUserData = {
      email: parsed.data.email,
      email_verified: true, // For demo purposes, we set this to true. In a real app, you'd want to handle email verification properly.
      verification_code: null,
      verification_expires: null,
      reset_code: null,
      reset_expires: null,
      password: hashedPassword,
      username: parsed.data.username,
      country: parsed.data.country,
      profileImageUrl: `https://i.pravatar.cc/150?img=1`, // Placeholder image URL, can be replaced with actual image handling logic

    }
    const newUser = new User(newUserData);
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

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
        timeout: 10000 // 10 second timeout
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

router.post("/loginUser", async (req, res) => {
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

    // Sign the token
    const jwtToken = jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // Set httpOnly cookie
    res.cookie("token", jwtToken, {
      httpOnly: true,     // Can't be accessed by JavaScript (prevents XSS)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax",    // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    console.log("✅ Cookie set. Token length:", jwtToken.length);
    console.log("Cookie headers being sent:", res.getHeaders()['set-cookie']);

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

module.exports = router;