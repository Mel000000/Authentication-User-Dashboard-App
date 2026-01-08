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


const sendMail = async (email) => {
    const code = generator.generate({
    length: 6,
    numbers: true,
  });
  return transporter.sendMail({
    from: `"Company" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${code}`,
    html: `<p>Your verification code is <b>${code}</b></p>`,
  });
};

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send("Email is required");

  try {
    const info = await sendMail(email);
    console.log("SMTP info:", info); // check accepted/rejected
    res.status(200).send("Verification email sent");
  } catch (err) {
    console.error("Mail error:", err);
    res.status(500).send("Failed to send email");
  }
});

module.exports = router;