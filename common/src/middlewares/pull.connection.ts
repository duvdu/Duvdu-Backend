// // bullmq-redis.ts
// import IORedis from 'ioredis';

// const bullRedis = new IORedis({
//   host: process.env.REDIS_HOST?.split('://')[1]?.split(':')[0] || 'localhost',
//   port: parseInt(process.env.REDIS_HOST?.split(':').pop() || '6379'),
//   password: process.env.REDIS_PASS,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
//   retryStrategy: (times) => {
//     if (times > 3) return null;
//     return Math.min(times * 100, 3000);
//   },
// });

// export { bullRedis };


// bullmq-redis.ts
import { getRedisClient } from './redis-connection';

// Create a function that returns the Redis client for BullMQ
export const getBullRedis = async () => {
  return await getRedisClient();
};