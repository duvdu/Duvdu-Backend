import { dbConnection } from '@duvdu-v1/duvdu';


import { app } from './app';
import { env, checkEnvVariables } from './config/env';
import SocketServer from './utils/socketImplementaion';
const start = async () => {
  checkEnvVariables();
  await dbConnection(env.mongoDb.uri);
  const server = app.listen(3000, () => {
    console.log('app listen on port 3000');
  });
  
  new SocketServer(server);
};

start();
