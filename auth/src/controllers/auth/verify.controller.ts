import { BadRequestError, NotFound, UnauthorizedError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Users } from '../../models/User.model';
import { SuccessResponse } from '../../types/success-response';
import { VerificationReason } from '../../types/User';
import { hashVerificationCode } from '../../utils/crypto';

export const verifyHandler: RequestHandler<
  unknown,
  SuccessResponse<{ reason: string; username: string }>,
  { username: string; code: string }
> = async (req, res, next) => {
  const user = await Users.findOne({ username: req.body.username });
  if (!user) return next(new NotFound('User not found'));
  if (!user.verificationCode?.code) return next(new UnauthorizedError());
  const currentTime = Date.now();
  const expireTime = new Date(user.verificationCode.expireAt || '0').getTime();
  if (currentTime > expireTime) return next(new BadRequestError('token expired'));
  if (user.verificationCode.code !== hashVerificationCode(req.body.code))
    return next(new BadRequestError('invalid code'));

  user.verificationCode.code = undefined;
  user.verificationCode.expireAt = undefined;
  if (user.verificationCode.reason === VerificationReason.forgetPassword)
    user.verificationCode.reason = VerificationReason.forgetPasswordVerified;
  else if (user.verificationCode.reason === VerificationReason.updateOldPhoneNumber)
    user.verificationCode.reason = VerificationReason.updateOldPhoneNumberVerified;
  else user.isVerified = true;
  await user.save();
  res.status(200).json({
    message: 'success',
    reason: user.verificationCode.reason as string,
    username: req.body.username,
  });
};
