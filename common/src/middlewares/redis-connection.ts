import RedisStore from 'connect-redis';
import Redis from 'ioredis';

import { DatabaseConnectionError } from '../errors/data-base-connections';

// Create a Redis cluster or connection pool
const MAX_CLIENTS = 1; // Single connection per service to minimize total connections
let connectionPool: Redis[] = [];
let currentConnectionIndex = 0;
let activeConnections = 0;
let isInitializing = false;

// Cache the RedisStore instance
let redisStoreInstance: RedisStore | null = null;

// Parse Redis connection details
const getRedisConfig = () => {
  // Get Redis configuration from environment variables
  const host = process.env.REDIS_HOST || 'redis-11177.c9.us-east-1-2.ec2.redns.redis-cloud.com';
  const port = parseInt(process.env.REDIS_PORT || '11177', 10);
  const password = process.env.REDIS_PASS || 'xgThFOa24hvwyVtsiNhIJiAxfhvJCLBU';
  
  return {
    host,
    port,
    password,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true, // Don't connect immediately
    retryStrategy: (times: number) => {
      if (times > 3) return null;
      return Math.min(times * 100, 3000);
    }
  };
};

// Get Redis client info to monitor connections
const getClientInfo = async (client: Redis) => {
  try {
    const info = await client.info('clients');
    const connectedClients = info.match(/connected_clients:(\d+)/);
    return connectedClients ? parseInt(connectedClients[1], 10) : 0;
  } catch (error) {
    return 0;
  }
};

// Log Redis server stats periodically
const startMonitoring = () => {
  const monitorInterval = 60000; // 1 minute
  setInterval(async () => {
    if (connectionPool.length > 0 && activeConnections > 0) {
      try {
        const clientCount = await getClientInfo(connectionPool[0]);
        console.log(`[REDIS] Stats: Connected clients: ${clientCount}, Pool size: ${connectionPool.length}, Active: ${activeConnections}`);
      } catch (error) {
        // Silent error
      }
    }
  }, monitorInterval);
};

// Initialize the connection pool
const initializePool = async () => {
  if (connectionPool.length === 0 && !isInitializing) {
    isInitializing = true;
    const config = getRedisConfig();
    
    for (let i = 0; i < MAX_CLIENTS; i++) {
      const client = new Redis(config);
      client.setMaxListeners(1000);
      
      // Add connection event listeners
      client.on('connect', () => {
        activeConnections++;
        console.log(`[REDIS] Client #${i+1} connected successfully (Active: ${activeConnections})`);
      });
      
      client.on('error', () => {
        // Silent error
      });
      
      client.on('close', () => {
        activeConnections = Math.max(0, activeConnections - 1);
      });
      
      connectionPool.push(client);
    }
    
    // Start monitoring
    startMonitoring();
    isInitializing = false;
  }
};

// Get a client from the pool using round-robin
export const getRedisClient = async () => {
  if (connectionPool.length === 0) {
    await initializePool();
  }
  
  // Round-robin selection (though with MAX_CLIENTS=1, this just returns the single client)
  const client = connectionPool[currentConnectionIndex];
  currentConnectionIndex = (currentConnectionIndex + 1) % connectionPool.length;
  
  // Ensure the client is connected
  if (client.status !== 'ready' && client.status !== 'connecting') {
    await client.connect();
  }
  
  return client;
};

export const redisConnection = async () => {
  try {
    const client = await getRedisClient();
    return client;
  } catch (error) {
    const config = getRedisConfig();
    throw new DatabaseConnectionError(`Cannot connect to Redis: ${config.host}:${config.port}`);
  }
};

export const sessionStore = async () => {
  // Return cached instance if available
  if (redisStoreInstance) {
    return redisStoreInstance;
  }
  
  const client = await getRedisClient();
  redisStoreInstance = new RedisStore({ client });
  return redisStoreInstance;
};

export const cleanupRedis = async () => {
  if (connectionPool.length > 0) {
    for (let i = 0; i < connectionPool.length; i++) {
      const client = connectionPool[i];
      await client.quit();
    }
    connectionPool = [];
    currentConnectionIndex = 0;
    activeConnections = 0;
    // Reset the store instance
    redisStoreInstance = null;
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
