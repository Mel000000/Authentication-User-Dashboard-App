const express = require("express");
const generator = require("generate-password");
const { sendMail } = require("../controllers/emailSender.js");
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const router = express.Router();
const { doubleCsrfProtection, generateToken } = require("../middleware/csrf");

router.use(helmet());


// Endpoint to request a verification code
router.post("/", doubleCsrfProtection, async (req, res) => {
  const { email, mode } = req.body;

  if (!email) return res.status(400).send("Email is required");

  try {
    const user = await User.findOne({ email });
    const code = generator.generate({ length: 6, numbers: true, lowercase: false, uppercase: false });
    const hashedCode = await bcrypt.hash(code, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (mode === "signup") {
      if (user && user.email_verified) {
        return res.status(400).send("Email already in use and verified");
      }

      // If an unverified placeholder exists, update it; otherwise create one
      if (user) {
        user.verifyCode = hashedCode;
        user.verifyCodeExpires = expires;
        await user.save();
      } else {
        await new User({
        email,
        verifyCode: hashedCode,
        verifyCodeExpires: expires,
        email_verified: false,       
        }).save();
      }
    } else {
      // Reset mode
      if (!user) return res.status(404).send("User not found");

      user.verifyCode = hashedCode;
      user.verifyCodeExpires = expires;
      await user.save();
    }

    await sendMail(email, code);
    return res.status(200).send("Verification email sent");

  } catch (err) {
    console.error("Mail error:", err);
    return res.status(500).send("Failed to send email");
  }
});

// Endpoint to verify the code and either complete signup or issue reset token
router.post("/verifyCode", doubleCsrfProtection, async (req, res) => {
  const { email, userCode, mode } = req.body;

  if (!email || !userCode) {
    return res.status(400).send("Email and code are required");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found or verification session expired");

    if (user.verifyCodeExpires < new Date()) {
      return res.status(400).send("Code expired. Request a new one.");
    }

    const isMatch = await bcrypt.compare(userCode, user.verifyCode);
    if (!isMatch) {
      return res.status(400).send("Invalid code");
    }

    if (mode === "signup") {
      user.email_verified = true;
      user.verifyCode = null;
      user.verifyCodeExpires = null;
      await user.save();
      // set cookies so the users is immediatly logged in
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const jwtToken = jwt.sign(
        { userId: user._id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const userResponse = {
        id: user._id,
        email: user.email,
        username: user.username,
        country: user.country,
        profileImageUrl: user.profileImageUrl,
      };

      return res.status(200).json({
        message: "Verification successful, logged in",
        user: userResponse,
      });
    }

    if (mode === "reset") {
      const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
      user.verifyCode = null;
      user.verifyCodeExpires = null;
      await user.save();
      return res.json({ resetToken });
    }

    return res.status(400).send("Unknown mode");
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).send("Internal server error during verification");
  }
});

// Reset password endpoint
router.post("/resetPassword", doubleCsrfProtection, async (req, res) => {
  const { email, newPassword } = req.body;
  const resetToken = req.query.token;

  // FIX: validate inputs before verifying token so we fail fast on bad payloads
  if (!email || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Invalid payload input rules" });
  }

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (!decoded || decoded.email !== email) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

module.exports = router;