const express = require("express");
const generator = require("generate-password");
const {sendMail} = require("../controllers/emailSender.js");
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();


// Endpoint to request a verification code
router.post("/", async (req, res) => {
  const { email } = req.body;
  const code = generator.generate({
    length: 6,
    numbers: true,
  });
  const hashedCode = await bcrypt.hash(code, 10)

  if (!email) return res.status(400).send("Email is required");

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.verifyCode = hashedCode;
    await user.save();
    const info = await sendMail(email,code);
    res.status(200).send("Verification email sent");
  } catch (err) {
    console.error("Mail error:", err);
    res.status(500).send("Failed to send email");
  }
});

// Endpoint to verify the code
router.post("/verifyCode",async (req,res) => {
    const {email, userCode } = req.body;

    if (!email || !userCode) {
        return res.status(400).send("Email and code are required");
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).send("User not found");
    }
    const isMatch = await bcrypt.compare(userCode, user.verifyCode);
    if (isMatch) {
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        user.verifyCode = null; // Clear the verification code after successful verification
        await user.save();
        res.json({ resetToken });
        //res.status(200).send("Code verified successfully");
    } else {
        res.status(400).send("Invalid code");
    }
})

router.post("/resetPassword", async (req, res) => {
    const { email, newPassword } = req.body;
    
    // Validate input
    if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password are required" });
    }
    
    // Validate password strength (add your requirements)
    if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        user.password = hashedPassword;
        await user.save();
        
        res.status(200).json({ message: "Password reset successfully" });
        
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ error: "Failed to reset password" });
    }
});

module.exports = router;  