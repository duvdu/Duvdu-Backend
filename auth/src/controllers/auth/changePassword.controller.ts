import 'express-async-errors';
import { UnauthenticatedError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { ChangePasswordHandler } from '../../types/endpoints';
import { comparePassword, hashPassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/generateToken';

export const changePassword: ChangePasswordHandler = async (req, res, next) => {
  const user = await Users.findById((req as any).user?.id);

  if (!user || !comparePassword(req.body.oldPassword, user.password || ''))
    return next(new UnauthenticatedError());

  const token = generateToken({ id: user.id });
  user.password = hashPassword(req.body.newPassword);
  user.token = token;
  await user.save();
  req.session = { jwt: token };

  res.status(200).json({ message: 'success' });
};
