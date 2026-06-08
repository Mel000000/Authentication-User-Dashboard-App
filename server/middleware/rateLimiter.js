// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

const sendCommand = (...args) => redisClient.call(...args);

const keyGenerator = (req) => {
  return req.ip || req.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
};

const authLimiter = rateLimit({
    store: new RedisStore({ sendCommand, prefix: 'rl-auth:' }),
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    keyGenerator,
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

module.exports = { generalLimiter, authLimiter, emailLimiter };