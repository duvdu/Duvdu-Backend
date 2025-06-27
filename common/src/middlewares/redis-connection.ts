import RedisStore from 'connect-redis';
import Redis from 'ioredis';

import { DatabaseConnectionError } from '../errors/data-base-connections';

// Create a Redis cluster or connection pool
const MAX_CLIENTS = 5; // Limited to 5 connections to stay well below the 30 connection limit
let connectionPool: Redis[] = [];
let currentConnectionIndex = 0;
let totalConnectionsRequested = 0;
let activeConnections = 0;

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

// Get Redis client info to monitor connections
const getClientInfo = async (client: Redis) => {
  try {
    const info = await client.info('clients');
    const connectedClients = info.match(/connected_clients:(\d+)/);
    return connectedClients ? parseInt(connectedClients[1], 10) : 0;
  } catch (error) {
    console.error('[REDIS] Error getting client info:', error);
    return 0;
  }
};

// Log Redis server stats periodically
const startMonitoring = () => {
  const monitorInterval = 60000; // 1 minute
  setInterval(async () => {
    if (connectionPool.length > 0) {
      try {
        const client = connectionPool[0]; // Use first client for monitoring
        const clientCount = await getClientInfo(client);
        console.log(`[REDIS] Server stats - Connected clients: ${clientCount}, Pool size: ${connectionPool.length}, Active tracked connections: ${activeConnections}`);
      } catch (error) {
        console.error('[REDIS] Error monitoring Redis:', error);
      }
    }
  }, monitorInterval);
};

// Initialize the connection pool
const initializePool = () => {
  if (connectionPool.length === 0) {
    const config = getRedisConfig();
    console.log(`[REDIS] Initializing connection pool with ${MAX_CLIENTS} clients to ${config.host}:${config.port}`);
    
    for (let i = 0; i < MAX_CLIENTS; i++) {
      const client = new Redis(config);
      client.setMaxListeners(1000);
      
      // Add connection event listeners
      client.on('connect', () => {
        activeConnections++;
        console.log(`[REDIS] Client #${i+1} connected successfully (Active: ${activeConnections})`);
      });
      
      client.on('error', (err) => {
        console.error(`[REDIS] Client #${i+1} connection error:`, err);
      });
      
      client.on('close', () => {
        activeConnections = Math.max(0, activeConnections - 1);
        console.log(`[REDIS] Client #${i+1} connection closed (Active: ${activeConnections})`);
      });
      
      connectionPool.push(client);
    }
    
    // Start monitoring
    startMonitoring();
  }
};

// Get a client from the pool using round-robin
export const getRedisClient = () => {
  if (connectionPool.length === 0) {
    initializePool();
  }
  
  totalConnectionsRequested++;
  
  // Round-robin selection
  const client = connectionPool[currentConnectionIndex];
  currentConnectionIndex = (currentConnectionIndex + 1) % connectionPool.length;
  
  if (totalConnectionsRequested % 100 === 0) {
    console.log(`[REDIS] Total connection requests: ${totalConnectionsRequested}, Current pool size: ${connectionPool.length}, Active connections: ${activeConnections}`);
  }
  
  return client;
};

export const redisConnection = async () => {
  try {
    const client = getRedisClient();
    const config = getRedisConfig();
    console.log(`[REDIS] Connection provided from pool to ${config.host}:${config.port}`);
    return client;
  } catch (error) {
    console.error(`[REDIS] Cannot connect to Redis: ${process.env.REDIS_HOST}`, error);
    throw new DatabaseConnectionError(`Cannot connect to Redis: ${process.env.REDIS_HOST}`);
  }
};

export const sessionStore = async () => {
  const client = getRedisClient();
  console.log('[REDIS] Created session store with pooled connection');
  return new RedisStore({ client });
};

export const cleanupRedis = async () => {
  if (connectionPool.length > 0) {
    console.log('[REDIS] Closing all Redis connections in the pool');
    for (let i = 0; i < connectionPool.length; i++) {
      const client = connectionPool[i];
      await client.quit();
      console.log(`[REDIS] Client #${i+1} quit successfully`);
    }
    connectionPool = [];
    currentConnectionIndex = 0;
    activeConnections = 0;
    console.log('[REDIS] Connection pool cleared');
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
