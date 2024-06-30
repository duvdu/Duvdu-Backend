import { Notification } from '@duvdu-v1/duvdu';

import { NotificationPublisher } from '../../event/publisher/notification.publisher';
import { natsWrapper } from '../../nats-wrapper';

export const contractNotification = async (
  contractId: string,
  targetUser: string,
  message: string,
) => {
  await Notification.create({
    targetUser,
    target: contractId,
    type: 'contract',
    title: 'contract',
    message,
  });
  await new NotificationPublisher(natsWrapper.client).publish({
    targetUsers: [targetUser],
    notificationDetails: {
      title: 'contract',
      message,
    },
  });
};
