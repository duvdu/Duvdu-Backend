import 'express-validator';
import { BadRequestError, Message, NotFound, UnauthorizedError } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

import { UpdateMessageHandler } from '../../types/endpoints/mesage.endpoints';

export const updateMessageHandler: UpdateMessageHandler = async (req, res, next) => {
  const message = await Message.findById(req.params.message);
  if (!message) return next(new NotFound(undefined, req.lang));

  if ([message.sender, message.receiver].includes(new Types.ObjectId(req.loggedUser.id)))
    return next(
      new UnauthorizedError(
        {
          en: `user not implementied in this chat ${req.loggedUser.id}`,
          ar: `المستخدم غير مشارك في هذه المحادثة ${req.loggedUser.id}`,
        },
        req.lang,
      ),
    );

  if (req.body.reactions) req.body.reactions[0].user = new Types.ObjectId(req.loggedUser.id);

  const updatedMessage = await Message.findByIdAndUpdate(req.params.message, req.body, {
    new: true,
  });
  if (!updatedMessage)
    return next(
      new BadRequestError(
        {
          en: `failed to update this message ${req.params.message}`,
          ar: `فشل في تحديث هذه الرسالة ${req.params.message}`,
        },
        req.lang,
      ),
    );
  res.status(200).json({ message: 'success', data: updatedMessage });
};
