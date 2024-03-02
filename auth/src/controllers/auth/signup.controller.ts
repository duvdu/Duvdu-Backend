import 'express-async-errors';

import { Plans } from '../../models/Plan.model';
import { Users } from '../../models/User.model';
import { createDefaultSavedProject } from '../../services/saved-projects/create-favourite.service';
import { SignupHandler } from '../../types/endpoints/user.endpoints';
import { hashPassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/generateToken';

export const signupHandler: SignupHandler = async (req, res) => {
  const plans = await Plans.find().sort('-createdAt').limit(1);

  const newUser = await Users.create({
    ...req.body,
    password: hashPassword(req.body.password),
    plan: plans[0].id,
  });
  const token = generateToken({ id: newUser.id });
  newUser.token = token;
  await newUser.save();
  await createDefaultSavedProject(newUser.id);
  req.session.jwt = token;
  res.status(201).json({ message: 'success' });
};
