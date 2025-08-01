import 'express-async-errors';

import { NotFound, Notification } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getOneNotificationHandler: RequestHandler<{ notificationId: string }> = async (
  req,
  res,
  next,
) => {
  const notification = await Notification.findById(req.params.notificationId)
    .populate([{ path: 'sourceUser', select: 'name username profileImage' }]);

  if (!notification) return next(new NotFound({ ar: 'الاشعار غير موجود', en: 'Notification not found' } , req.lang));

  res.status(200).json({
    message: 'success',
    data: notification,
  });
};
