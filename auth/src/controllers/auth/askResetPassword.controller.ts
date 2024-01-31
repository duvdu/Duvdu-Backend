import 'express-async-errors';

import { NotFound } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { AskResetPasswordHandler } from '../../types/endpoints/user.endpoints';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const askResetPasswordHandler: AskResetPasswordHandler = async (req, res, next) => {
  console.log(await Users.find());

  const user = await Users.findOne({ username: req.body.username });

  if (!user) return next(new NotFound('user not found'));

  const randomCode: string = generateRandom6Digit();
  const hashedCode = hashVerificationCode(randomCode);

  user.verificationCode = {
    code: hashedCode,
    expireAt: Date.now() + 10 * 60 * 1000,
  };
  user.isVerified = false;
  await user.save();

  //   send otp

  res.status(200).json({ message: 'success' });
};
