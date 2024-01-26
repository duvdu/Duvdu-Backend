import 'express-async-errors';

import { NotFound, UnauthenticatedError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { ResetPasswordHandler } from '../../types/endpoints';
import { hashPassword } from '../../utils/bcrypt';
import { hashVerificationCode } from '../../utils/crypto';

export const resetPasswordHandler: ResetPasswordHandler = async (req, res, next) => {
  const hashEnterdCode = hashVerificationCode(req.body.verificationCode);
  const user = await Users.findOne({ username: req.body.username });

  if (!user) return next(new NotFound('user not found'));

  const currentDate: number = new Date().getTime();

  if (
    currentDate > user.verificationCode!.expireAt ||
    user.verificationCode!.code != hashEnterdCode
  )
    return next(new UnauthenticatedError('invalid or expired verification code'));

  user.verificationCode = {
    code: '',
    expireAt: 0,
  };
  user.password = hashPassword(req.body.newPassword);
  await user.save();

  res.status(200).json({ message: 'success' });
};
