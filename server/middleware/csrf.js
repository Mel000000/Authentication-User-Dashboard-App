const { doubleCsrf } = require("csrf-csrf");
const isProduction = process.env.NODE_ENV === 'production';

const csrfInstance = doubleCsrf({
  getSecret: (req) => process.env.CSRF_SECRET,
  getSessionIdentifier: (req) => req.sessionID,
  cookieName: isProduction ? "__Host-csrf" : "csrf",
  cookieOptions: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    domain: isProduction ? ".onrender.com" : undefined,
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

module.exports = {
  doubleCsrfProtection: csrfInstance.doubleCsrfProtection ?? csrfInstance.csrf,
  generateToken: csrfInstance.generateCsrfToken ?? csrfInstance.generateToken,
};