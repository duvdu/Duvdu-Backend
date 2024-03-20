<<<<<<< HEAD
import { Plans } from '../../models/Plan.model';
=======
import 'express-async-errors';

import { NotFound } from '@duvdu-v1/duvdu';

>>>>>>> main
import { Roles } from '../../models/Role.model';
import { Users } from '../../models/User.model';
import { SignupHandler } from '../../types/endpoints/user.endpoints';
import { hashPassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/generateToken';

export const signupHandler: SignupHandler = async (req, res , next) => {
  const role = await Roles.findOne({key:'not verified'});
  if (!role) return next(new NotFound('start role not found'));

  const newUser = await Users.create({
    ...req.body,
    password: hashPassword(req.body.password),
    role: role?.id,
  });
  const token = generateToken({ id: newUser.id, permession: role.features });
  newUser.token = token;
  await newUser.save();
  req.session.jwt = token;
  res.status(201).json({ message: 'success' });
};
