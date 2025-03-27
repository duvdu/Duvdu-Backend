import { NotFound, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const blockUserHandler: RequestHandler<
  { userId: string },
  SuccessResponse,
  { reason: string },
  unknown
> = async (req, res, next) => {
  const user = await Users.findById(req.params.userId);

  if (!user)
    return next(new NotFound({ en: 'user not found', ar: 'لم يتم العثور على المستخدم' }, req.lang));

  user.isBlocked = { reason: req.body.reason, value: true };

  await user.save();
  res.status(200).json({ message: 'success' });
};


