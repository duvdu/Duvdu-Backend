import { redisConnection } from '@duvdu-v1/duvdu';

import { totalLogged, totalVisitors } from '../types/socket-events';

const cleanupAndRecalculateLoggedUsers = async (client: any) => {
  try {
    // Get all logged user keys
    const keys = await client.keys('logged_user_*');
    
    // Count only non-expired keys
    let validCount = 0;
    for (const key of keys) {
      const ttl = await client.ttl(key);
      if (ttl > 0) {
        validCount++;
      } else if (ttl === -1) {
        // Key exists but has no expiration, count it
        validCount++;
      }
      // ttl === -2 means key doesn't exist (already expired)
    }
    
    console.log(`Found ${validCount} valid logged users after cleanup`);
    await client.set(totalLogged, validCount);
  } catch (error) {
    console.error('Error cleaning up logged users:', error);
    // On error, reset to 0 as fallback
    await client.set(totalLogged, 0);
  }
};

export const handleRedisConnection = async () => {
  const client = await redisConnection();
  // Only reset visitors on restart - logged users should persist across restarts
  // unless they've explicitly logged out
  await client.set(totalVisitors, 0);
  
  // For logged users, we'll clean up expired user keys and recalculate count
  // This handles the case where the server restarted while users were connected
  await cleanupAndRecalculateLoggedUsers(client);
};
