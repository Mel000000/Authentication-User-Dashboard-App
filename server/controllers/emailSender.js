const nodemailer = require("nodemailer");

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Example SMTP server (for Gmail)
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "melina.reisinger07@gmail.com",
    pass: "melina4emily",
  },
});

// Send an email using async/await
module.exports.sendMail = async () => {
  const info = await transporter.sendMail({
    from: '"Melina Reisinger" <melina.reisinger07@gmail.com>', // sender address
    to: "xavierlachs@gmail.com, xavierlachs@gmail.com", // list of receivers
    subject: "Email sending worked ✔",
    text: "yes work", // Plain-text version of the message
    html: "<b>yes work</b>", // HTML version of the message
  });

  console.log("Message sent:", info.messageId);
};