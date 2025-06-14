import { redisConnection } from '@duvdu-v1/duvdu';

import { totalLogged, totalVisitors } from '../types/socket-events';

let redisClient: Awaited<ReturnType<typeof redisConnection>> | null = null;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = await redisConnection('', ' ');
  }
  return redisClient;
};

export const addUserToLogged = async (n = 1) => {
  const client = await getRedisClient();
  const count = +((await client.get(totalLogged)) || 0);
  await client.set(totalLogged, count + n);
  return count + n;
};

export const addUserToVisitor = async (n = 1) => {
  const client = await getRedisClient();
  const count = +((await client.get(totalVisitors)) || 0);
  await client.set(totalVisitors, count + n);
  return count + n;
};

export const getLoggedCount = async () => {
  const client = await getRedisClient();
  return +((await client.get(totalLogged)) || 0);
};

export const getVisitorCount = async () => {
  const client = await getRedisClient();
  return +((await client.get(totalVisitors)) || 0);
};
