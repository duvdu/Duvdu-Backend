import 'express-async-errors';
import { UnauthenticatedError, UnauthorizedError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { SigninHandler } from '../../types/endpoints/user.endpoints';
import { comparePassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/generateToken';

export const signinHandler: SigninHandler = async (req, res, next) => {
  const user = await Users.findOne({ username: req.body.username });
  if (!user || !comparePassword(req.body.password, user.password || ''))
    return next(new UnauthenticatedError());
  if (!user.isVerified) return next(new UnauthorizedError());
  const token = generateToken({ id: user.id });
  req.session = { jwt: token };
  // res.cookie('jwt', token, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true });
  user.token = token;
  await user.save();
  console.log(token);
  res.status(200).json({ message: 'success' });
};
