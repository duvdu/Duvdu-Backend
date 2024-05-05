import 'express-async-errors';

import { Notification } from '@duvdu-v1/duvdu';

import { UpdateWatchNotificationHandler } from '../../types/endpoints/notification.endpoint';


export const updateWatchNotificationHandler: UpdateWatchNotificationHandler = async (
  req,
  res,
) => {

  await Notification.updateMany(
    { targetUser: req.loggedUser?.id, watched: false }, 
    { watched: true },
  );

  res.status(200).json({ message: 'success' });
};
