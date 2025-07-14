import 'express-async-errors';

import { BadRequestError, Notification, Users } from '@duvdu-v1/duvdu';

import { SendNotificationMultiUserHandler } from '../../types/endpoints/notification.endpoint';
import { sendFcmToMultipleUsers } from '../../utils/sendFcmToMultiUser';

export const sendNotificationToMultiUserHandler: SendNotificationMultiUserHandler = async (
  req,
  res,
  next,
) => {
  try {
    const users = await Users.find({ _id: { $in: req.body.users } }).select('fcmTokens');

    if (users.length !== req.body.users.length)
      return next(
        new BadRequestError({ en: 'invalid users', ar: 'مستخدمين غير صالحين' }, req.lang),
      );

    const notificationTokens = users
      .flatMap((user) => user.fcmTokens.map((token) => token.fcmToken))
      .filter((token) => token !== null && token !== undefined);

    // save notification to database
    for (const user of users) {
      await Notification.create({
        title: req.body.title,
        message: req.body.message,
        target: user._id,
        sourceUser: req.loggedUser?.id,
        targetUser: req.loggedUser?.id,
      });
    }

    if (notificationTokens.length > 0) {
      const fcmResult = await sendFcmToMultipleUsers(
        notificationTokens,
        req.body.title,
        req.body.message,
      );
      console.log('FCM notification result:', fcmResult);
    }

    res.status(200).json({ message: 'success' });
  } catch (error) {
    res.status(500).json(<any>{ message: 'failed to send fcm notification' });
  }
};
