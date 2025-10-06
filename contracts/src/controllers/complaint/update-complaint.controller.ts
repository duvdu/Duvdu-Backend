import {
  Channels,
  SuccessResponse,
  Notification,
  NotFound,
  Users,
  ContractReports,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { NewNotificationPublisher } from '../../event/publisher/newNotification.publisher';
import { natsWrapper } from '../../nats-wrapper';

export const updateComplaintHandler: RequestHandler<
  { id: string },
  SuccessResponse,
  { feedback: string; sendNotification?: boolean }
> = async (req, res, next) => {
  const isSystem = req.body.sendNotification ?? false;
  const complaint = await ContractReports.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        state: {
          addedBy: req.loggedUser.id,
          feedback: req.body.feedback,
          isSystem: !isSystem,
        },
      },
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
      message: 'complaint updated',
      title: `${user?.name} has updated a complaint with feedback ${req.body.feedback}`,
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

  res.status(200).json({ message: 'success' });
};
