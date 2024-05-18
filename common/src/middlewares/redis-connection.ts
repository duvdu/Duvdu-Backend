// import RedisStore from 'connect-redis';
// import { createClient } from 'redis';

// import { DatabaseConnectionError } from '../errors/data-base-connections';


// export const redisConnection = async (url: string , password:string) => {
//   const client = createClient({ url , password });
//   await client
//     .connect()
//     .then(() => console.log(`redis connected in : ${url}`))
//     .catch(() => {
//       throw new DatabaseConnectionError(`cannot connect to redis : ${url}`);
//     });
//   return client;
// };

// export const sessionStore = (url: string , password:string) => new RedisStore({ client: redisConnection(url , password) });

import RedisStore from 'connect-redis';
import { createClient } from 'redis';

import { DatabaseConnectionError } from '../errors/data-base-connections'; // Assuming this is in a separate file

// Combine connection logic and error handling for clarity
async function connectToRedis(url: string, password: string): Promise<ReturnType<typeof createClient>> {
  const client = createClient({ url, password });
  try {
    await client.connect();
    console.log(`Redis connected to: ${url}`);
    return client;
  } catch (error) {
    throw new DatabaseConnectionError(`Cannot connect to Redis: ${url}  , error:${error}`);
  }
}

// Create session store using the connection function
export const sessionStore = async (url: string, password: string): Promise<RedisStore> => {
  const client = await connectToRedis(url, password);
  return new RedisStore({ client });
};