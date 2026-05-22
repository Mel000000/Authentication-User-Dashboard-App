const { Resend } = require('resend');
require("dotenv").config(); // load .env

const resend = new Resend(process.env.RESEND_API_KEY);


// Function to send email
module.exports.sendMail = async (email,code) => {
    try {
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev', // Default free domain provided by Resend for testing
        to: email,               // The user's actual email address
        subject: 'Your Verification Code',
        html: `
          <h3>Your Verification Code</h3>
          <p>Your verification code is: <strong>${code}</strong></p>
        `
      });

      if (error) {
        console.error("Resend execution error details:", error);
        throw new Error("Email delivery network issue.");
      }

    } catch (error) {
      console.error("Server catch block error:", error);
      throw new Error("Internal server processing error.");
    }
};
