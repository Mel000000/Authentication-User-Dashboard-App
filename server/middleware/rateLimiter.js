// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

const sendCommand = (...args) => redisClient.call(...args);

const generalLimiter = rateLimit({
    store: new RedisStore({ sendCommand, prefix: 'rl-general:' }),
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    store: new RedisStore({ sendCommand, prefix: 'rl-auth:' }),
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    message: { error: 'Too many authentication attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const emailLimiter = rateLimit({
    store: new RedisStore({ sendCommand, prefix: 'rl-email:' }),
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Too many email requests, please wait an hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, emailLimiter };