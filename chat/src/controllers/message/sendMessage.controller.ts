import 'express-async-errors';
import {
  Bucket,
  Contracts,
  FOLDERS,
  Iuser,
  Message,
  NotAllowedError,
  NotFound,
  Notification,
  NotificationType,
  SystemRoles,
  TeamProject,
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

  const contract = await Contracts.findOne({
    $or: [
      { sp: req.loggedUser.id, customer: req.body.receiver },
      { sp: req.body.receiver, customer: req.loggedUser.id },
    ],
  }).populate({
    path: 'contract',
    match: {
      status: {
        $nin: ['canceled', 'pending', 'rejected', 'reject', 'cancel'],
      },
    },
  });

  const project = await TeamProject.findOne({
    isDeleted: false,
    creatives: {
      $elemMatch: {
        'users.user': { $all: [req.loggedUser.id, req.body.receiver] }, // Both should exist in users
      },
    },
  });

  const isMainUser =
    project &&
    (project.user.toString() === req.loggedUser.id.toString() ||
      project.user.toString() === req.body.receiver!.toString());

  // Check if the sender and receiver are in the same creative users array
  const isInCreatives = project?.creatives.some((creative) =>
    creative.users.some((u) =>
      [req.loggedUser.id.toString(), req.body.receiver?.toString()].includes(u.user.toString()),
    ),
  );

  if (!contract && !isMainUser && !isInCreatives && req.loggedUser.role.key !== SystemRoles.admin) {
    return next(new NotAllowedError(undefined, req.lang));
  }

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
      mediaArray.push(media);
    }
    (req.body as any).media = mediaArray;
  }

  const message = await Message.create({
    ...req.body,
    sender: req.loggedUser.id,
    watchers: [
      { user: req.body.receiver, watched: false },
      { user: req.loggedUser.id, watched: false },
    ],
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
    target: req.loggedUser.id,
    message: NotificationDetails.newMessage.message,
    title: NotificationDetails.newMessage.title,
  });

  const populatedNotification = await (
    await notification.save()
  ).populate('sourceUser', 'isOnline profileImage username name');

  const io = req.app.get('socketio');
  sendNotificationOrFCM(
    io,
    Channels.new_message,
    notification.targetUser.toString(),
    {
      title: `${(populatedNotification.sourceUser as Iuser).name}`,
      message: `${notification.message} from ${(populatedNotification.sourceUser as Iuser).name}`,
    },
    populatedNotification,
    populatedMessage,
  );
  await Notification.findByIdAndDelete(notification._id);
  res.status(201).json({ message: 'success', data: populatedMessage });
};
