import 'express-async-errors';
import { Bucket, Message, NotFound, UnauthorizedError } from '@duvdu-v1/duvdu';

import { DeleteMessageHandler } from '../../types/endpoints/mesage.endpoints';

export const deleteMessageHandler: DeleteMessageHandler = async (req, res, next) => {
  const message = await Message.findById(req.params.message);
  if (!message)
    return next(
      new NotFound(
        {
          en: `message not found ${req.params.message}`,
          ar: `الرسالة غير موجودة ${req.params.message}`,
        },
        req.lang,
      ),
    );

  if (message.sender.toString() != req.loggedUser.id)
    return next(
      new UnauthorizedError(
        {
          en: `user dont owner for this message ${req.params.message}`,
          ar: `المستخدم ليس مالكاً لهذه الرسالة ${req.params.message}`,
        },
        req.lang,
      ),
    );

  if (message.media && message.media.length > 0) {
    const s3 = new Bucket();
    for (const attach of message.media) {
      await s3.removeBucketFiles(attach.url);
    }
  }

  await Message.findByIdAndDelete(req.params.message);
  res.status(204).json({ message: 'success' });
};
