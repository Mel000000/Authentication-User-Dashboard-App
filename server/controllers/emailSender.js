const dotenv = require("dotenv");
require("dotenv").config(); // load .env

// controllers/emailSender.js
const nodemailer = require('nodemailer');

// Create reusable transporter object using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT, 10),
  secure: false, // true for 465, false for other ports (587)
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

module.exports.sendMail = async (email, code) => {
  const mailOptions = {
    from: `"${process.env.BREVO_FROM_NAME}" <${process.env.BREVO_FROM_EMAIL}>`,
    to: email,
    subject: 'Your Verification Code',
    html: `
      <h3>Your Verification Code</h3>
      <p>Your verification code is: <strong>${code}</strong></p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Brevo SMTP error:', error);
    throw new Error('Failed to send email via SMTP');
  }
};

