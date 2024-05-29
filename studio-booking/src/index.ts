import { dbConnection } from '@duvdu-v1/duvdu';

import { app } from './app';
import { env, checkEnvVariables } from './config/env';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  
  checkEnvVariables();
  await natsWrapper.connect(
    env.nats.clusterId!,
    env.nats.clientId!,
    env.nats.url!
  );

  natsWrapper.client.on('close', () => {
    console.log('nats connection close ');
    process.exit();
  });

  process.on('SIGINT', () => {
    natsWrapper.client.close();
  });

  process.on('SIGTERM', () => {
    natsWrapper.client.close();
  });

  await dbConnection(env.mongoDb.uri);
  app.listen(3000, () => {
    console.log('app listen on port 3000');
  });
};

start();
