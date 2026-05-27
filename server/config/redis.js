// server/config/redis.js
const { Redis } = require('@upstash/redis');

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// @upstash/redis doesn't have 'connect' or 'error' events in the same way.
// It automatically handles retries and reports errors via the promises.
console.log('Upstash Redis client configured');

module.exports = redisClient;