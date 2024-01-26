import { BadRequestError, NotFound } from '@duvdu-v1/duvdu';

import 'express-async-errors';
import { UpdateProfileHandler } from './../../types/endpoints';
import { Categories } from '../../models/Category.model';
import { Users } from '../../models/User.model';

export const updateProfileHandler: UpdateProfileHandler = async (req, res, next) => {
  if (req.body.category) {
    const category = await Categories.findById(req.body.category);
    if (!category) return next(new NotFound('category not found'));
  }
  const user = await Users.findByIdAndUpdate(req.user?.id, req.body);
  if (!user) return next(new BadRequestError('cannot update this user'));

  res.status(200).json({ message: 'success' });
};
