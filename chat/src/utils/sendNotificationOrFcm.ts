import { Inotification, NotFound, Users } from '@duvdu-v1/duvdu';
import SocketIO from 'socket.io';

import admin from './fireBaseConfig';

export async function sendFCMNotification(
  token: string,
  title: string,
  message: string,
  data: Inotification,
) {
  const transformedData: { [key: string]: string } = {};
  const relevantFields = [
    '_id',
    'createdAt',
    'updatedAt',
    'title',
    'message',
    'watched',
    'target',
    'type',
    'targetUser',
    'sourceUser',
  ];
  relevantFields.forEach((field) => {
    if (data[field as keyof Inotification]) {
      transformedData[field] = String(data[field as keyof Inotification]);
    }
  });

  const messagePayload = {
    notification: {
      title: title,
      body: message,
    },
    apns: {
      payload: {
        aps: {
          contentAvailable: true, 
        },
      },
    },
    data: transformedData,
    token: token,
  };

  try {
    const response = await admin.messaging().send(messagePayload);
    console.log('Successfully sent FCM notification:', response);
  } catch (error) {
    console.error('Error sending FCM notification:', error);
  }
}

export async function sendNotificationOrFCM(
  io: SocketIO.Server,
  socketChannel: string,
  targetUserId: string,
  notificationDetails: { title: string; message: string },
  populatedNotification: Inotification,
) {
  const userSocket = io.sockets.sockets.get(targetUserId);

  if (userSocket) {
    console.log('user socket true');

    userSocket.join(targetUserId);
    io.to(targetUserId).emit(socketChannel, {
      data: populatedNotification,
    });
  }
  const user = await Users.findById(targetUserId);
  console.log('iam here');

  if (!user) throw new NotFound(`Target user not found ${targetUserId}`);
  if (user.notificationToken)
    await sendFCMNotification(
      user.notificationToken,
      notificationDetails.title,
      notificationDetails.message,
      populatedNotification,
    );
}
