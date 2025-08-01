import {
  Channels,
  ContractReports,
  NotFound,
  Notification,
  SuccessResponse,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { NewNotificationPublisher } from '../../event/publisher/newNotification.publisher';
import { natsWrapper } from '../../nats-wrapper';

export const closeComplaintHandler: RequestHandler<
  { id: string },
  SuccessResponse,
  { feedback?: string; sendNotification?: boolean }
> = async (req, res, next) => {
  const complaint = await ContractReports.findByIdAndUpdate(
    req.params.id,
    {
      ...(req.body.feedback
        ? {
          $push: {
            state: {
              addedBy: req.loggedUser?.id,
              feedback: req.body.feedback,
            },
          },
        }
        : {}),
      isClosed: true,
      closedBy: req.loggedUser?.id,
    },
    { new: true },
  );

  if (!complaint) return next(new NotFound(undefined, req.lang));

  if (req.body.sendNotification != undefined && req.body.sendNotification) {
    const user = await Users.findById(req.loggedUser.id);

    const notification = await Notification.create({
      sourceUser: req.loggedUser.id,
      targetUser: complaint.reporter,
      type: 'contract',
      target: complaint.contract.toString(),
      message: 'complaint closed',
      title: `${user?.name} has closed a complaint`,
    });

    const populatedNotification = await (
      await notification.save()
    ).populate('sourceUser', 'isOnline profileImage username faceRecognition');

    await new NewNotificationPublisher(natsWrapper.client).publish({
      notificationDetails: { message: notification.message, title: notification.title },
      populatedNotification,
      socketChannel: Channels.notification,
      targetUser: notification.targetUser.toString(),
    });
  }

  return res.status(200).json({ message: 'success' });
};
