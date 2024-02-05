import 'express-async-errors';
import { BadRequestError, NotFound, UnauthorizedError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { ResendVerificationCodeHandler } from '../../types/endpoints/user.endpoints';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const resendVerificationCodeHandler: ResendVerificationCodeHandler = async (
  req,
  res,
  next,
) => {
  const user = await Users.findOne({ username: req.body.username });
  if (!user) return next(new NotFound());
  if (!user.verificationCode || !user.verificationCode.code) return next(new UnauthorizedError());
  const restSecondsToResend = getRestSecondsToResend(user.verificationCode.expireAt);
  if (restSecondsToResend > 0)
    return next(new BadRequestError(`will be available in ${restSecondsToResend} seconds`));
  const verificationCode = generateRandom6Digit();
  user.verificationCode = {
    code: hashVerificationCode(verificationCode),
    expireAt: new Date(Date.now() + 60 * 1000).toString(),
  };
  await user.save();
  //TODO: send verification code by OTP server
  res.status(200).json({ message: 'success' });
};

const getRestSecondsToResend = (expireAt: string) => {
  const expireAtTime = new Date(expireAt || 0).getTime();
  const currentTime = Date.now();
  return expireAtTime > currentTime ? Math.ceil((expireAtTime - currentTime) / 1000) : -1;
};
