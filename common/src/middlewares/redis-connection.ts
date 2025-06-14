import RedisStore from 'connect-redis';
import { createClient } from 'redis';

import { DatabaseConnectionError } from '../errors/data-base-connections';

let redisClient: ReturnType<typeof createClient> | null = null;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_HOST,
      password: process.env.REDIS_PASS,
    });
    
    // Set a higher limit for event listeners
    redisClient.setMaxListeners(20);
  }
  return redisClient;
};

export const redisConnection = async (url: string, password: string) => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    console.log(`Redis connected in : ${url}`);
    return client;
  } catch (error) {
    console.error(`Cannot connect to Redis: ${url}`, error);
    throw new DatabaseConnectionError(`Cannot connect to Redis: ${url}`);
  }
};

export const sessionStore = async (url: string, password: string) => {
  const client = getRedisClient();
  return new RedisStore({ client });
};

export const cleanupRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
