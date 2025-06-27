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

// Use the existing Redis client from redis-connection.ts
const bullRedis = getRedisClient();

// BullMQ specific settings can be configured in redis-connection.ts
// or we can create a new connection if specific settings are required
// for BullMQ that can't be shared with the main Redis client

export { bullRedis };