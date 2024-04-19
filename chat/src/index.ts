import { dbConnection } from '@duvdu-v1/duvdu';
import sharedSession from 'express-socket.io-session';
import { Server } from 'socket.io';

import { app, mySession } from './app';
import { env, checkEnvVariables } from './config/env';
import { IcustomHandshake } from './types/customSocket';
const start = async () => {
  console.log('test deployment');
  checkEnvVariables();
  await dbConnection(env.mongoDb.uri);
  const server = app.listen(3000, () => {
    console.log('app listen on port 3000');
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.use(sharedSession(mySession));
  io.on('connection', (socket: IcustomHandshake) => {
    if (socket.handshake.session.jwt) {
      console.log(socket.handshake.session);
      console.log('user connect with auth');
    } else {
      console.log('user connect without auth');
    }
  });
};

start();
