import 'express-async-errors';

import { Notification } from '@duvdu-v1/duvdu';

import { GetLoggedUserNotificationHandler } from '../../types/endpoints/notification.endpoint';

export const getLoggedUserNotificationHandler: GetLoggedUserNotificationHandler = async (
  req,
  res,
) => {
  const notifications = await Notification.find({ targetUser: req.loggedUser?.id })
    .limit(req.pagination.limit)
    .skip(req.pagination.skip)
    .sort({ watched: -1, createdAt: -1 })
    .populate([{ path: 'sourceUser', select: 'name username profileImage' }]);

  const resultCount = await Notification.countDocuments({ targetUser: req.loggedUser?.id });

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: notifications,
  });
};
