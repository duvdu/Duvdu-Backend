import 'express-async-errors';
import { UnauthenticatedError, UnauthorizedError } from '@duvdu-v1/duvdu';

import { Roles } from '../../models/Role.model';
import { Users } from '../../models/User.model';
import { SigninHandler } from '../../types/endpoints/user.endpoints';
import { comparePassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/generateToken';

export const signinHandler: SigninHandler = async (req, res, next) => {
  const user = await Users.findOne({ username: req.body.username });

  if (!user || !comparePassword(req.body.password, user.password || ''))
    return next(new UnauthenticatedError());
  if (!user.isVerified?.value) return next(new UnauthorizedError());
  const role = await Roles.findById(user.role);
  if (!role) return next(new UnauthenticatedError('user dont have a role'));
  const token = generateToken({ id: user.id, permession: role.features });

  req.session.jwt = token;
  user.token = token;
  user.isVerified.value = true;
  await user.save();
  res.status(200).json({ message: 'success' });
};
