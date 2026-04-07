const express = require("express");
const generator = require("generate-password");
const {sendMail} = require("../controllers/emailSender.js");
const User = require("../models/user");

const router = express.Router();

const codeStorage = {}; // In-memory storage for demo purposes

// Endpoint to request a verification code
router.post("/", async (req, res) => {
  const { email } = req.body;
  const code = generator.generate({
    length: 6,
    numbers: true,
  });

  if (!email) return res.status(400).send("Email is required");
  codeStorage[email] = code; // Store the code associated with the email

  try {
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
    const storedCode = codeStorage[email];
    if (storedCode === userCode) {
        res.status(200).send("Verified");
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
        
        console.log(`Password reset successfully for user: ${email}`);
        res.status(200).json({ message: "Password reset successfully" });
        
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ error: "Failed to reset password" });
    }
});

module.exports = router;  