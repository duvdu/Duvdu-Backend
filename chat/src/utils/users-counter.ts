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
  
  // Prevent count from going negative
  const newCount = Math.max(0, count + n);
  await client.set(totalLogged, newCount);
  return newCount;
};

// Track unique logged users to prevent double counting
export const addUniqueLoggedUser = async (userId: string) => {
  const client = await getClient();
  const key = `logged_user_${userId}`;
  const exists = await client.exists(key);
  
  if (!exists) {
    // Set with expiration (24 hours) as a safety measure
    await client.setEx(key, 86400, '1');
    return await addUserToLogged(1);
  }
  
  return await getLoggedCount();
};

export const removeUniqueLoggedUser = async (userId: string) => {
  const client = await getClient();
  const key = `logged_user_${userId}`;
  const exists = await client.exists(key);
  
  if (exists) {
    await client.del(key);
    return await addUserToLogged(-1);
  }
  
  return await getLoggedCount();
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