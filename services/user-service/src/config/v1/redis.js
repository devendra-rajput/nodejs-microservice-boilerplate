const Redis = require('ioredis');
const { logger } = require('../../utils/logger');

// We need to prefer the Docker environment variables if they exist.
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = process.env.REDIS_PORT || 6379;

const redisUrl = `redis://${redisHost}:${redisPort}`;

const redisClient = new Redis(redisUrl, {
  lazyConnect: true, // Don't connect immediately
  retryStrategy: (times) => {
    // Exponential backoff: 50ms, 100ms, 200ms, 400ms, etc.
    const delay = Math.min(times * 50, 2000);
    logger.warn(`Redis reconnecting... Attempt ${times}, delay: ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: 3, // Maximum retry attempts per command
  enableReadyCheck: true, // Check if Redis is ready before sending commands
  enableOfflineQueue: true, // Queue commands when disconnected
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    // logger.info('✅ Redis connected successfully!');
  } catch (error) {
    logger.error('Redis Connection Error:', error);
    logger.error('Error Message:', error.message);
    logger.error('Stack Trace:', error.stack);
    process.exit(1);
  }
};

// /**
//  * Event listener: Redis is ready to accept commands
//  */
// redisClient.on('ready', () => {
//   logger.info('✅ Redis is ready!');
// });

// /**
//  * Event listener: Redis connection established
//  */
// redisClient.on('connect', () => {
//   logger.info('🔌 Redis connection established');
// });

redisClient.on('reconnecting', () => {
  logger.warn('⚠️  Redis reconnecting...');
});

redisClient.on('error', (error) => {
  logger.error('Redis Error:', error.message);
});

redisClient.on('close', () => {
  logger.warn('⚠️  Redis connection closed');
});

redisClient.on('end', () => {
  logger.warn('⚠️  Redis connection ended');
});

const getRedisStatus = () => redisClient.status;

const isRedisReady = () => redisClient.status === 'ready';

// Export Redis client and connection function
module.exports = {
  redisClient,
  connectRedis,
  getRedisStatus,
  isRedisReady,
};
