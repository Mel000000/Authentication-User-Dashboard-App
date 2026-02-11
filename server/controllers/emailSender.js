const nodemailer = require("nodemailer");
require("dotenv").config(); // load .env

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: `${process.env.EMAIL_USER}`,
    pass: `${process.env.EMAIL_PASS}`,
  },
});

// Function to send email
module.exports.sendMail = async (email,code) => {
  return transporter.sendMail({
    from: `"Company" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${code}`,
    html: `<p>Your verification code is <b>${code}</b></p>`,
  });
};
