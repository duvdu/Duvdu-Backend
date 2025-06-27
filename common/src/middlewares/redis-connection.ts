import RedisStore from 'connect-redis';
import Redis from 'ioredis';

import { DatabaseConnectionError } from '../errors/data-base-connections';

// Create a Redis cluster or connection pool
const MAX_CLIENTS = 5; // Limited to 5 connections to stay well below the 30 connection limit
let connectionPool: Redis[] = [];
let currentConnectionIndex = 0;

// Parse Redis connection details
const getRedisConfig = () => {
  let host = process.env.REDIS_HOST;
  let port = 6379;
  
  // Handle URL format (redis://hostname:port)
  if (host?.includes('://')) {
    const urlParts = host.split('://');
    if (urlParts[1]?.includes(':')) {
      const hostParts = urlParts[1].split(':');
      host = hostParts[0];
      port = parseInt(hostParts[1], 10) || 6379;
    } else if (urlParts[1]) {
      host = urlParts[1];
    }
  }

  return {
    host,
    port,
    password: process.env.REDIS_PASS,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 3) return null;
      return Math.min(times * 100, 3000);
    }
  };
};

// Initialize the connection pool
const initializePool = () => {
  if (connectionPool.length === 0) {
    console.log(`Initializing Redis connection pool with ${MAX_CLIENTS} clients`);
    const config = getRedisConfig();
    
    for (let i = 0; i < MAX_CLIENTS; i++) {
      const client = new Redis(config);
      client.setMaxListeners(1000);
      connectionPool.push(client);
    }
  }
};

// Get a client from the pool using round-robin
export const getRedisClient = () => {
  if (connectionPool.length === 0) {
    initializePool();
  }
  
  // Round-robin selection
  const client = connectionPool[currentConnectionIndex];
  currentConnectionIndex = (currentConnectionIndex + 1) % connectionPool.length;
  
  return client;
};

export const redisConnection = async () => {
  try {
    const client = getRedisClient();
    console.log(`Redis connected to: ${process.env.REDIS_HOST}`);
    return client;
  } catch (error) {
    console.error(`Cannot connect to Redis: ${process.env.REDIS_HOST}`, error);
    throw new DatabaseConnectionError(`Cannot connect to Redis: ${process.env.REDIS_HOST}`);
  }
};

export const sessionStore = async () => {
  const client = getRedisClient();
  return new RedisStore({ client });
};

export const cleanupRedis = async () => {
  if (connectionPool.length > 0) {
    console.log('Closing all Redis connections in the pool');
    for (const client of connectionPool) {
      await client.quit();
    }
    connectionPool = [];
    currentConnectionIndex = 0;
  }
};





// import RedisStore from 'connect-redis';
// import { createClient } from 'redis';

// import { DatabaseConnectionError } from '../errors/data-base-connections';

// let redisClient: ReturnType<typeof createClient> | null = null;

// export const getRedisClient = () => {
//   if (!redisClient) {
//     redisClient = createClient({
//       url: process.env.REDIS_HOST,
//       password: process.env.REDIS_PASS,
//     });

//     // Set a higher limit for event listeners
//     redisClient.setMaxListeners(20);
//   }
//   return redisClient;
// };

// export const redisConnection = async (url: string, password: string) => {
//   try {
//     const client = getRedisClient();
//     if (!client.isOpen) {
//       await client.connect();
//     }
//     console.log(`Redis connected in : ${url}`);
//     return client;
//   } catch (error) {
//     console.error(`Cannot connect to Redis: ${url}`, error);
//     throw new DatabaseConnectionError(`Cannot connect to Redis: ${url}`);
//   }
// };

// export const sessionStore = async (url: string, password: string) => {
//   const client = getRedisClient();
//   return new RedisStore({ client });
// };

// export const cleanupRedis = async () => {
//   if (redisClient) {
//     await redisClient.quit();
//     redisClient = null;
//   }
// };
