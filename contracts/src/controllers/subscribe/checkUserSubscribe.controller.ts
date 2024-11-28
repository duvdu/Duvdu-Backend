import { NotFound, Setting, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const checkUserSubscribeController: RequestHandler<
  unknown,
  SuccessResponse,
  unknown,
  unknown
> = async (req, res, next) => {
  const user = await Users.findById(req.loggedUser.id);
  if (!user) return next(new NotFound({ en: 'user not found', ar: 'المستخدم غير موجود' } , req.lang));

  if (user.avaliableContracts > 0)
    return res.status(200).json(<any>{ message: 'success', data: { avaliableContracts: user.avaliableContracts } });

  const setting = await Setting.findOne();
  if (!setting)
    return next(new NotFound({ en: 'setting not found ', ar: 'الإعدادات غير موجودة' }, req.lang));
  
};
