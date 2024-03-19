import 'express-async-errors';

import { NotFound } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { AskResetPasswordHandler } from '../../types/endpoints/user.endpoints';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const askResetPasswordHandler: AskResetPasswordHandler = async (req, res, next) => {
  const user = await Users.findOne({ username: req.body.username });

  if (!user) return next(new NotFound('user not found'));

  const randomCode: string = generateRandom6Digit();
  const hashedCode = hashVerificationCode(randomCode);

  user.verificationCode = {
    code: hashedCode,
    expireAt: new Date(Date.now() + 60 * 1000).toString(),
  };
  user.isVerified = {
    value:false,
    reason:''
  };
  await user.save();

  //   send otp

  res.status(200).json({ message: 'success' });
};
