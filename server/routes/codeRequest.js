const express = require("express");
const generator = require("generate-password");
const {sendMail} = require("../controllers/emailSender.js");

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

module.exports = router;  