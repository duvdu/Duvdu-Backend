import { Notification } from '@duvdu-v1/duvdu';

import { NewNotificationPublisher } from '../event/publisher/newNotification.publisher';
import { natsWrapper } from '../nats-wrapper';

export const sendNotification = async (
  sourceUser: string,
  targetUser: string,
  target: string,
  type: string,
  title: string,
  message: string,
  channel: string,
) => {
  const notification = await Notification.create({
    sourceUser: sourceUser,
    targetUser: targetUser,
    type: type,
    target: target,
    message: message,
    title: title,
  });

  const populatedNotification = await (
    await notification.save()
  ).populate('sourceUser', 'isOnline profileImage username faceRecognition');

  await new NewNotificationPublisher(natsWrapper.client).publish({
    notificationDetails: { message: notification.message, title: notification.title },
    populatedNotification,
    socketChannel: channel,
    targetUser: notification.targetUser.toString(),
  });
};

export const sendSystemNotification = async (
  users: string[],
  target: string,
  type: string,
  message: string,
  title: string,
  channel: string,
) => {
  for (let i = 0; i < users.length; i++) {
    const notification = await Notification.create({
      targetUser: users[i],
      type: type,
      target: target,
      message: message,
      title: title,
    });

    const populatedNotification = await (
      await notification.save()
    ).populate('sourceUser', 'isOnline profileImage username faceRecognition');

    await new NewNotificationPublisher(natsWrapper.client).publish({
      notificationDetails: { message: notification.message, title: notification.title },
      populatedNotification,
      socketChannel: channel,
      targetUser: notification.targetUser.toString(),
    });
  }
};
