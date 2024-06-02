import { redisClient } from '@duvdu-v1/duvdu';

import { totalLogged, totalVisitors } from '../types/socket-events';

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

export const getLoggedCount = async () => +((await redisClient.get(totalLogged )) || 0);
export const getVisitorCount = async () => +((await redisClient.get(totalVisitors)) || 0);
