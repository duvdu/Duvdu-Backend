import 'express-async-errors';

import { SendNotificationForSpecificTopicHandler } from '../../types/endpoints/notification.endpoint';
import { sendFcmToSpecificTopic } from '../../utils/sendFcmForSpecificTopic';

export const sendTopicNotificationHandler: SendNotificationForSpecificTopicHandler = async (
  req,
  res,
) => {
  try {
    await sendFcmToSpecificTopic(req.body.topic, req.body.title, req.body.message);
    res.status(200).json({ message: 'success' });
  } catch (error) {
    res.status(500).json(<any>{ message: 'failed to send fcm notification' });
  }
};
