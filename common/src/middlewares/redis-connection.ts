import RedisStore from 'connect-redis';
import { createClient } from 'redis';

import { DatabaseConnectionError } from '../errors/data-base-connections';


export const redisConnection = async (url: string , password:string) => {
  const client = createClient({ url , password });
  await client
    .connect()
    .then(() => console.log(`redis connected in : ${url}`))
    .catch(() => {
      throw new DatabaseConnectionError(`cannot connect to redis : ${url}`);
    });
  return client;
};

export const sessionStore = (url: string , password:string) => new RedisStore({ client: redisConnection(url , password) });

