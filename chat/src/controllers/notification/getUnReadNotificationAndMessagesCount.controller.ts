import { Message, Notification, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const getUnReadNotificationAndMessagesCountController: RequestHandler<
  unknown,
  SuccessResponse<{ data: { messagesCount: number; notificationsCount: number; count: number } }>,
  unknown,
  unknown
> = async (req, res) => {
  const [unWatchedNotificationsCount, unreadMessagesCount] = await Promise.all([
    Notification.countDocuments({
      targetUser: req.loggedUser?.id,
      watched: false,
    }),
    Message.countDocuments({
      receiver: req.loggedUser?.id,
      watchers: {
        $elemMatch: {
          user: req.loggedUser?.id,
          watched: false,
        },
      },
    }),
  ]);
  res.status(200).json({
    message: 'success',
    data: {
      messagesCount: unreadMessagesCount,
      notificationsCount: unWatchedNotificationsCount,
      count: unWatchedNotificationsCount + unreadMessagesCount,
    },
  });
};
