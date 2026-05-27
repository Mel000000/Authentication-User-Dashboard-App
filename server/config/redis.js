// server/config/redis.js
const Redis = require('ioredis');

// Use the Upstash Redis TLS URL
const redisClient = new Redis(process.env.UPSTASH_REDIS_URL, {
  tls: {
    rejectUnauthorized: false, // required for Upstash TLS
  },
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('connect', () => console.log('✅ Redis connected via ioredis'));
redisClient.on('error', (err) => console.error('Redis error:', err));

module.exports = redisClient;