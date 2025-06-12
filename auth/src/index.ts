import { dbConnection, redisConnection } from '@duvdu-v1/duvdu';

import { appInit } from './../seeds/roles.seeder';
import { app } from './app';
import { env, checkEnvVariables } from './config/env';
import { natsWrapper } from './nats-wrapper';
import { twilioService } from './services/twilio.service';

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
  app.listen(3000, async () => {
    console.log('app listen on port 3000');
    console.log(env.environment);
    // twilioService.sendOtp('+201026272813', '123456');

    await appInit();
  });
};

start();
