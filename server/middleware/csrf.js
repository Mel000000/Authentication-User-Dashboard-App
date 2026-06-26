const { doubleCsrf } = require("csrf-csrf");
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === "test";

const isDeployed = isProduction;

const csrfInstance = doubleCsrf({
  getSecret: (req) => process.env.CSRF_SECRET,
  getSessionIdentifier: (req) => req.sessionID,
  cookieName: isDeployed ? "csrf-token-prod" : "csrf-token-dev",
  cookieOptions: {
    httpOnly: true,
    secure: isDeployed,
    sameSite: isDeployed ? "none" : "lax",
    path: "/",
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

module.exports = {
  doubleCsrfProtection: csrfInstance.doubleCsrfProtection ?? csrfInstance.csrf,
  generateToken: csrfInstance.generateCsrfToken ?? csrfInstance.generateToken,
};