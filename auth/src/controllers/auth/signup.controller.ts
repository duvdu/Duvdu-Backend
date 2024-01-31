import 'express-async-errors';

import { Users } from '../../models/User.model';
import { SignupHandler } from '../../types/endpoints/user.endpoints';
import { hashPassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/generateToken';

//TODO: add plan free by default to user if it exists
export const signupHandler: SignupHandler = async (req, res) => {
  const newUser = await Users.create({ ...req.body, password: hashPassword(req.body.password) });
  const token = generateToken({ id: newUser.id });
  newUser.token = token;
  await newUser.save();
  req.session = { jwt: token };
  res.status(201).json({ message: 'success' });
};
