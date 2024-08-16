import { Iuser, NotFound, Roles, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import 'express-async-errors';
import { hashPassword } from '../../utils/bcrypt';

export const createUserHandler: RequestHandler<
  unknown,
  SuccessResponse,
  Pick<Iuser, 'name' | 'username' | 'phoneNumber' | 'password' | 'role'>,
  unknown
> = async (req, res, next) => {
  const role = await Roles.findById(req.body.role);
  if (!role)
    return next(new NotFound({ en: 'role not found', ar: 'لم يتم العثور على الدور' }, req.lang));

  await Users.create({
    ...req.body,
    isVerified: true,
    password: await hashPassword(req.body.password!),
  });

  res.status(201).json({ message: 'success' });
};
