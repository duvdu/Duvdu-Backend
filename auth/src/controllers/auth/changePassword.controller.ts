import 'express-async-errors';
import { UnauthenticatedError } from '@duvdu-v1/duvdu';

import { Roles } from '../../models/Role.model';
import { Users } from '../../models/User.model';
import { ChangePasswordHandler } from '../../types/endpoints/user.endpoints';
import { comparePassword, hashPassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/generateToken';

export const changePasswordHandler: ChangePasswordHandler = async (req, res, next) => {
  const user = await Users.findById(req.loggedUser?.id);

  if (!user || !comparePassword(req.body.oldPassword, user.password || ''))
    return next(new UnauthenticatedError());
  const role = await Roles.findById(user.role);
  if (!role) return next(new UnauthenticatedError('user dont have arole'));

  const token = generateToken({ id: user.id, permession: role.features });
  user.password = hashPassword(req.body.newPassword);
  user.token = token;
  await user.save();
  req.session.jwt = token;

  res.status(200).json({ message: 'success' });
};
