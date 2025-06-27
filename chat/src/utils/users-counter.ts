import { getRedisClient } from '@duvdu-v1/duvdu';

import { totalLogged, totalVisitors } from '../types/socket-events';

const redisClient = getRedisClient();

export const addUserToLogged = async (n = 1) => {
  const count = +((await redisClient.get(totalLogged)) || 0);
  await redisClient.set(totalLogged, count + n);
  return count + n;
};

export const addUserToVisitor = async (n = 1) => {
  const count = +((await redisClient.get(totalVisitors)) || 0);
  await redisClient.set(totalVisitors, count + n);
  return count + n;
};

export const getLoggedCount = async () => {
  return +((await redisClient.get(totalLogged)) || 0);
};

export const getVisitorCount = async () => {
  return +((await redisClient.get(totalVisitors)) || 0);
};
