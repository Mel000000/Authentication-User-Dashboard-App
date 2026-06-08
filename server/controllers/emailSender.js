require("dotenv").config(); // load .env

module.exports.sendMail = async (email, code) => {
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

  const data = await response.json();
  return data;
};
