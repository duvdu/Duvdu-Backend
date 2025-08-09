import { getRedisClient } from '@duvdu-v1/duvdu';

import { totalLogged, totalVisitors } from '../types/socket-events';

let redisClient: any = null;

const getClient = async () => {
  if (!redisClient) {
    redisClient = await getRedisClient();
  }
  return redisClient;
};

export const addUserToLogged = async (n = 1) => {
  const client = await getClient();
  const count = +((await client.get(totalLogged)) || 0);
  await client.set(totalLogged, count + n);
  return count + n;
};

export const addUserToVisitor = async (n = 1) => {
  const client = await getClient();
  const count = +((await client.get(totalVisitors)) || 0);
  await client.set(totalVisitors, count + n);
  return count + n;
};

export const getLoggedCount = async () => {
  const client = await getClient();
  return +((await client.get(totalLogged)) || 0);
};

export const getVisitorCount = async () => {
  const client = await getClient();
  return +((await client.get(totalVisitors)) || 0);
};

export const resetTotalVisitorsCount = async () => {
  const client = await getClient();
  await client.set(totalVisitors, 0);
};