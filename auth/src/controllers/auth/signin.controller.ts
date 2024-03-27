import { UnauthenticatedError, Roles, Users } from '@duvdu-v1/duvdu';

import { SigninHandler } from '../../types/endpoints/user.endpoints';
import { comparePassword } from '../../utils/bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';

export const signinHandler: SigninHandler = async (req, res, next) => {
  const user = await Users.findOne({ username: req.body.username });

  if (!user || !(await comparePassword(req.body.password, user.password || '')))
    return next(new UnauthenticatedError());

  const role = await Roles.findById(user.role);
  if (!role) return next(new UnauthenticatedError('user dont have a role'));

  const accessToken = generateAccessToken({
    id: user.id,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    role: { key: role.key, permissions: role.permissions },
  });
  const refreshToken = generateRefreshToken({ id: user.id });

  req.session.access = accessToken;
  req.session.refresh = refreshToken;
  user.token = refreshToken;

  await user.save();
  res.status(200).json({ message: 'success' });
};
