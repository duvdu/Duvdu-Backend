import { BadRequestError, NotFound, UnauthorizedError, Users } from '@duvdu-v1/duvdu';

import { ResendVerificationCodeHandler } from '../../types/endpoints/user.endpoints';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const resendVerificationCodeHandler: ResendVerificationCodeHandler = async (
  req,
  res,
  next,
) => {
  const user = await Users.findOne({ username: req.body.username });
  if (!user)
    return next(new NotFound({ en: 'User not found', ar: 'المستخدم غير موجود' }, req.lang));
  if (!user.verificationCode?.reason) return next(new UnauthorizedError());
  const currentTime = Date.now();
  const expireTime = new Date(user.verificationCode.expireAt || '0').getTime();
  if (currentTime < expireTime)
    return next(new BadRequestError(`${Math.ceil((expireTime - currentTime) / 1000)}`));

  const code = generateRandom6Digit();
  user.verificationCode = {
    code: hashVerificationCode(code),
    expireAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    reason: user.verificationCode.reason,
  };
  await user.save();

  //TODO: send OTP
  res.status(200).json(<any>{ message: 'success', code });
};
