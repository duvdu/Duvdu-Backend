import 'express-async-errors';

import {
  BadRequestError,
  Channels,
  Follow,
  NotFound,
  Notification,
  NotificationType,
  Users,
} from '@duvdu-v1/duvdu';

import { NewNotificationPublisher } from '../../event/publisher/newNotification.publisher';
import { natsWrapper } from '../../nats-wrapper';
import { FollowHandler } from '../../types/endpoints/follow.endpoints';

export const followHandler: FollowHandler = async (req, res, next) => {
  const follow = await Follow.findOne({
    follower: req.loggedUser.id,
    following: req.params.userId,
  });


  if (follow)
    return next(
      new BadRequestError(
        {
          en: `user ${req.loggedUser.id} is already follow this user ${req.params.userId}`,
          ar: `المستخدم ${req.loggedUser.id} يتابع بالفعل هذا المستخدم ${req.params.userId}`,
        },
        req.lang,
      ),
    );

  const user = await Users.findById(req.params.userId);
  if (!user)
    return next(new NotFound({ en: 'user not found', ar: 'المستخدم غير موجود' }, req.lang));

  const sourceUser = await Users.findById(req.loggedUser.id);
  if (!sourceUser)
    return next(new NotFound({ en: 'user not found', ar: 'المستخدم غير موجود' }, req.lang));

  const newFollow = await Follow.create({
    follower: req.loggedUser.id,
    following: req.params.userId,
  });

  if (newFollow) {
    user.followCount.followers++;
    sourceUser.followCount.following++;
    await sourceUser.save();
    await user.save();
  }

  const notification = await Notification.create({
    sourceUser: req.loggedUser.id,
    targetUser: req.params.userId,
    type: NotificationType.new_follower,
    target: newFollow._id,
    title: 'new follower',
    message: `${sourceUser.name} start follow you`,
  });

  const populatedNotification = await (
    await notification.save()
  ).populate('sourceUser', 'isOnline profileImage username');

  await new NewNotificationPublisher(natsWrapper.client).publish({
    notificationDetails: { message: notification.message, title: notification.title },
    populatedNotification,
    socketChannel: Channels.new_follower,
    targetUser: notification.targetUser.toString(),
  });

  res.status(200).json({ message: 'success' });
};
