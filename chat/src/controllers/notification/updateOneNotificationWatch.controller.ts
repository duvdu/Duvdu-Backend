import 'express-async-errors';

import { Notification } from '@duvdu-v1/duvdu';

import { UpdateOneWatchNotificationHandler } from '../../types/endpoints/notification.endpoint';

export const updateOneWatchNotificationHandler: UpdateOneWatchNotificationHandler = async (
  req,
  res,
) => {
  await Notification.findOneAndUpdate(
    { targetUser: req.loggedUser?.id , _id:req.params.notificationId },
    { watched: true },
  );
  
  res.status(200).json({ message: 'success' });
};