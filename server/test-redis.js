require('dotenv').config();
const redisClient = require('./config/redis');

(async () => {
  try {
    await redisClient.set('test-key', 'Redis works!');
    const value = await redisClient.get('test-key');
    console.log('Redis test:', value);
    redisClient.disconnect();
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();