import 'express-async-errors';
import {
  Bucket,
  Files,
  FOLDERS,
  Message,
  NotFound,
  Notification,
  NotificationType,
  Users,
} from '@duvdu-v1/duvdu';

import { SendMessageHandler } from '../../types/endpoints/mesage.endpoints';
import { NotificationDetails } from '../../types/notificationDetails';
import { Channels } from '../../types/socketChannels';
import { sendNotificationOrFCM } from '../../utils/sendNotificationOrFcm';

export const sendMessageHandler: SendMessageHandler = async (req, res, next) => {
  const receiver = await Users.findById(req.body.receiver);
  if (!receiver)
    return next(
      new NotFound(
        {
          en: `no receiver in this id ${req.body.receiver}`,
          ar: `لا يوجد مستقبل بهذا المعرف ${req.body.receiver}`,
        },
        req.lang,
      ),
    );

  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
  if (attachments) {
    (req.body as any).media = {};
    const s3 = new Bucket();
    await s3.saveBucketFiles(FOLDERS.chat, ...attachments);
    const mediaArray = [];
    for (const attach of attachments) {
      const media = {
        url: `${FOLDERS.chat}/${attach.filename}`,
        type: attach.mimetype,
      };
      Files.removeFiles(`${FOLDERS.chat}/${attach.filename}`);
      mediaArray.push(media);
    }
    (req.body as any).media = mediaArray;
  }

  const message = await Message.create({
    ...req.body,
    sender: req.loggedUser.id,
  });

  const populatedMessage = await message.populate([
    { path: 'sender', select: 'profileImage isOnline username name' },
    { path: 'receiver', select: 'profileImage isOnline username name' },
    { path: 'reactions.user', select: 'profileImage isOnline username name' },
  ]);

  const notification = await Notification.create({
    sourceUser: req.loggedUser.id,
    targetUser: req.body.receiver,
    type: NotificationType.new_message,
    target: message._id,
    message: NotificationDetails.newMessage.message,
    title: NotificationDetails.newMessage.title,
  });

  const populatedNotification = await (
    await notification.save()
  ).populate('sourceUser', 'isOnline profileImage username');

  const io = req.app.get('socketio');
  sendNotificationOrFCM(
    io,
    Channels.new_message,
    notification.targetUser.toString(),
    { title: notification.title, message: notification.message },
    populatedNotification,
  );
  await Notification.findByIdAndDelete(notification._id);
  res.status(201).json({ message: 'success', data: populatedMessage });
};
