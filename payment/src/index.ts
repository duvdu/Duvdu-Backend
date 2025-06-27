import { dbConnection, redisConnection } from '@duvdu-v1/duvdu';

import { app } from './app';
import { env, checkEnvVariables } from './config/env';
import { natsWrapper } from './nats-wrapper';
import { initializeProjectQueues } from './utils/expirationProjectQueue';
import { initializeRentalQueues } from './utils/expirationRentalQueue';

const start = async () => {
  checkEnvVariables();
  await redisConnection('', ' ');

  await natsWrapper.connect(env.nats.clusterId!, env.nats.clientId!, env.nats.url!);

  natsWrapper.client.on('close', () => {
    console.log('nats connection close');
    process.exit();
  });

  process.on('SIGINT', () => {
    natsWrapper.client.close();
  });

  process.on('SIGTERM', () => {
    natsWrapper.client.close();
  });

  await dbConnection(env.mongoDb.uri);
  
  // Initialize BullMQ queues
  await initializeProjectQueues();
  await initializeRentalQueues();

  app.listen(3000, () => {
    console.log('app listen on port 3000');
  });
};

start();
