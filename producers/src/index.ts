import { dbConnection } from '@duvdu-v1/duvdu';

import { app } from './app';
import { env, checkEnvVariables } from './config/env';

const start = async () => {
  
  checkEnvVariables();
  await dbConnection(env.mongoDb.uri);
  app.listen(3000, () => {
    console.log('app listen on port 3000');
  });
};

start();
