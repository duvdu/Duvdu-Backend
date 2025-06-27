import { redisConnection } from '@duvdu-v1/duvdu';

import { totalLogged, totalVisitors } from '../types/socket-events';

export const handleRedisConnection = async () => {
  const client = await redisConnection();
  await client.set(totalLogged, 0);
  await client.set(totalVisitors, 0);
};
