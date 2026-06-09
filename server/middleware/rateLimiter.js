// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

const sendCommand = (...args) => redisClient.call(...args);

const getClientIp = (req) => {
  // X-Forwarded-For may be a comma-separated list: "client, proxy1, proxy2"
  // The leftmost value is the original client.
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  // Fallback for direct connections (local dev)
  return req.socket?.remoteAddress || 'unknown';
};

const keyGenerator = (req) => getClientIp(req);

const authLimiter = rateLimit({
    store: new RedisStore({ sendCommand, prefix: 'rl-auth:' }),
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyGenerator,
    skipSuccessfulRequests: true,
    message: { error: 'Too many authentication attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const emailLimiter = rateLimit({
    store: new RedisStore({ sendCommand, prefix: 'rl-email:' }),
    windowMs: 60 * 60 * 1000,
    max: 3,
    keyGenerator,
    message: { error: 'Too many email requests, please wait an hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, emailLimiter };