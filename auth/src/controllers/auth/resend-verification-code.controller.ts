import 'express-async-errors';
import { NotFound, UnauthorizedError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { ResendVerificationCodeHandler } from '../../types/endpoints';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const resendVerificationCodeHandler: ResendVerificationCodeHandler = async (
  req,
  res,
  next,
) => {
  const user = await Users.findById(req.body.username);
  if (!user) return next(new NotFound());
  if (user.isVerified && !user.isBlocked) return next(new UnauthorizedError());
  const verificationCode = generateRandom6Digit();
  user.verificationCode = {
    code: hashVerificationCode(verificationCode),
    expireAt: Date.now() + 10 * 60 * 1000,
  };
  await user.save();
  //TODO: send verification code by OTP server
  res.status(200).json({ message: 'success' });
};
