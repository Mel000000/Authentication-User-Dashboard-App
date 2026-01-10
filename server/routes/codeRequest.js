const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");
const generator = require("generate-password");

const router = express.Router();

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: `${process.env.EMAIL_USER}`,
    pass: `${process.env.EMAIL_PASS}`,
  },
});


const sendMail = async (email,code) => {
  return transporter.sendMail({
    from: `"Company" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${code}`,
    html: `<p>Your verification code is <b>${code}</b></p>`,
  });
};
const codeStorage = {}; // In-memory storage for demo purposes

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