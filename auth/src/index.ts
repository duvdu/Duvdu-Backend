import { dbConnection } from '@duvdu-v1/duvdu';

import { appInit } from './../seeds/roles.seeder';
import { app } from './app';
import { env, checkEnvVariables } from './config/env';

const start = async () => {
  console.log('test deploymet.. ');
  
  checkEnvVariables();
  await dbConnection(env.mongoDb.uri);
  app.listen(3000, async() => {
    console.log('app listen on port 3000');
    await appInit();
  });
};

start();
