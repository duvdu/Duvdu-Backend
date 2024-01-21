import 'express-async-errors';

import { BadRequestError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { SignupHandler } from '../../types/endpoints';
import { hashPassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/generateToken';

export const signupHandler: SignupHandler = async (req, res, next) => {
  const user = await Users.findOne({ username: req.body.username });
  if (user) return next(new BadRequestError('username already exists'));

  const newUser = await Users.create({ ...req.body, password: hashPassword(req.body.password) });
  const token = generateToken(newUser.id);
  req.session = { jwt: token };
  res.status(201).json({ message: 'success' });
};
