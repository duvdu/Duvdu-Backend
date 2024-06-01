import { redisClient, redisConnection } from '@duvdu-v1/duvdu';

import { totalLogged, totalVisitors } from '../types/socket-events';

export const handleRedisConnection = async () => {
  await redisConnection('', ' ');
  await redisClient.set(totalLogged, 0);
  await redisClient.set(totalVisitors, 0);
};
