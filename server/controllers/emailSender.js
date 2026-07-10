require("dotenv").config(); // load .env

const isTest = process.env.NODE_ENV === "test";
const isdevelopment = process.env.NODE_ENV === "development";

module.exports.sendMail = async (email, code) => {
  if (isTest || isdevelopment) {
    const response = await fetch(`${process.env.MAILPIT_URL}/api/v1/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        From: { Email: "authApp@gmail.com", Name: "Auth App" },
        To: [{ Email: email }],
        Subject: 'Your Verification Code',
        HTML: `
          <h3>Your Verification Code</h3>
          <p>Your verification code is: <strong>${code}</strong></p>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailpit send error:', response.status, errorText);
      throw new Error('Failed to send email via Mailpit');
    }

    return response.json();
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_FROM_NAME,
        email: process.env.BREVO_FROM_EMAIL,
      },
      to: [{ email }],
      subject: 'Your Verification Code',
      htmlContent: `
        <h3>Your Verification Code</h3>
        <p>Your verification code is: <strong>${code}</strong></p>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Brevo API error:', response.status, errorText);
    throw new Error('Failed to send email via Brevo API');
  }

  return response.json();
};