import { BadRequestError, NotFound } from '@duvdu-v1/duvdu';

import 'express-async-errors';
import { UpdateProfileHandler } from './../../types/endpoints/user.endpoints';
import { Categories } from '../../models/Category.model';
import { Users } from '../../models/User.model';
import { saveFiles, removeFiles } from '../../utils/file';

export const updateProfileHandler: UpdateProfileHandler = async (req, res, next) => {
  const files = <{ coverImage?: [Express.Multer.File]; profileImage?: Express.Multer.File[] }>(
    req.files
  );
  const coverImage = files.coverImage ? files.coverImage[0] : undefined;
  const profileImage = files.profileImage ? files.profileImage[0] : undefined;
  if (req.body.category) {
    const category = await Categories.findById(req.body.category);
    if (!category) return next(new NotFound('category not found'));
  }
  const user = await Users.findByIdAndUpdate(req.loggedUser?.id, {
    ...req.body,
    [coverImage ? 'coverImage' : (null as any)]: `/media/images/${coverImage?.filename}`,
    [profileImage ? 'profileImage' : (null as any)]: `/media/images/${profileImage?.filename}`,
  });
  if (!user) return next(new BadRequestError('cannot update this user'));
  saveFiles('images', profileImage, coverImage);
  removeFiles(
    profileImage ? user.profileImage : undefined,
    coverImage ? user.coverImage : undefined,
  );
  res.status(200).json({ message: 'success' });
};
