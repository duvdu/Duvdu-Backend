import { DatabaseConnectionError } from '@duvdu-v1/duvdu';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';


export const redisConnection = async (url: string, password: string) => {
  try {
    const client = createClient({ url, password });
    await client.connect();
    console.log(`Redis connected in : ${url}`);
    return client;
  } catch (error) {
    console.error(`Cannot connect to Redis: ${url}`, error);
    throw new DatabaseConnectionError(`Cannot connect to Redis: ${url}`);
  }
};

export const sessionStore = async (url: string, password: string) => {
  const client = await redisConnection(url, password);
  return new RedisStore({ client });
};
