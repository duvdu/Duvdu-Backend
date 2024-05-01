import RedisStore from 'connect-redis';
import { createClient } from 'redis';

import { DatabaseConnectionError } from '../errors/data-base-connections';


export const redisConnection = (url: string , password:string , port:number) => {
  const client = createClient({
    password,
    socket:{
      host:url,
      port
    }
  });
  client
    .connect()
    .then(() => console.log(`redis connected in : ${url}`))
    .catch(() => {
      throw new DatabaseConnectionError(`cannot connect to redis : ${url}`);
    });
  return client;
};

export const sessionStore = (url: string , password:string , port:number) => new RedisStore({ client: redisConnection(url, password , port) });
