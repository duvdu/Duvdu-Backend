import { dbConnection } from '@duvdu-v1/duvdu';
import { Server } from 'socket.io';

import { app } from './app';
import { env, checkEnvVariables } from './config/env';
import { NewNotificationListener } from './event/listiner/newNotification.listiner';
import { NotificationListener } from './event/listiner/notification.listener';
import { natsWrapper } from './nats-wrapper';
import { handleRedisConnection } from './utils/handle-redis-connection';
import { SocketServer } from './utils/socketImplementaion';

let io: Server | undefined;
const start = async () => {
  checkEnvVariables();
  await handleRedisConnection();

  await natsWrapper.connect(env.nats.clusterId!, env.nats.clientId!, env.nats.url!);

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

  new NewNotificationListener(natsWrapper.client).listen();
  new NotificationListener(natsWrapper.client).listen();

  await dbConnection(env.mongoDb.uri);
  
  const server = app.listen(3000, () => {
    console.log('app listen on port 3000');
  });

  const socketServer = new SocketServer(server);
  io = socketServer.io;
  // Set the socket.io instance in the app
  app.set('socketio', socketServer.io);
};

export function getSocketIOInstance(): Server {
  if (!io) {
    throw new Error('Socket.IO instance has not been initialized');
  }
  return io;
}

start();
