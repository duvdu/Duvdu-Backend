import RedisStore from 'connect-redis';
import { createClient } from 'redis';

import { DatabaseConnectionError } from '../errors/data-base-connections';

export const redisClient = createClient({
  url: process.env.REDIS_HOST,
  password: process.env.REDIS_PASS,
});

export const redisConnection = async (url: string, password: string) => {
  try {
    await redisClient.connect();
    console.log(`Redis connected in : ${url}`);
    return redisClient;
  } catch (error) {
    console.error(`Cannot connect to Redis: ${url}`, error);
    throw new DatabaseConnectionError(`Cannot connect to Redis: ${url}`);
  }
};

export const sessionStore = async (url: string, password: string) => {
  return new RedisStore({ client: redisClient });
};
