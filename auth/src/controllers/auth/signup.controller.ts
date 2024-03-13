import { Plans } from '../../models/Plan.model';
import { Roles } from '../../models/Role.model';
import { Users } from '../../models/User.model';
import { SignupHandler } from '../../types/endpoints/user.endpoints';
import { hashPassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/generateToken';

export const signupHandler: SignupHandler = async (req, res) => {
  const unverifiedRole = await Roles.findOne({ key: 'un-verified' });
  if (!unverifiedRole) throw new Error('un-verified role not found');
  const newUser = await Users.create({
    ...req.body,
    password: hashPassword(req.body.password),
    role: unverifiedRole,
  });
  const token = generateToken({ id: newUser.id, role: unverifiedRole });
  newUser.token = token;
  await newUser.save();
  req.session.jwt = token;
  res.status(201).json({ message: 'success' });
};
