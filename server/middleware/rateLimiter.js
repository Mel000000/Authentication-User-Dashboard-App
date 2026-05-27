// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis'); 

// helper to create a sendCommand function, which can be reused by all stores
const sendCommand = (...args) => redisClient.call(...args);

const generalLimiter = rateLimit({
    store: new RedisStore({
        sendCommand,
        prefix: 'rl-general:', // unique prefix for this limiter
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    store: new RedisStore({
        sendCommand,
        prefix: 'rl-auth:', // unique prefix for this limiter
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // stricter limit for auth endpoints
    skipSuccessfulRequests: true, // optional: don't count successful requests
    message: { error: 'Too many authentication attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const emailLimiter = rateLimit({
    store: new RedisStore({
        sendCommand,
        prefix: 'rl-email:', // unique prefix for this limiter
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit email requests
    message: { error: 'Too many email requests, please wait an hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, emailLimiter };