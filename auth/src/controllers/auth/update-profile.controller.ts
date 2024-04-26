import { BadRequestError, NotFound, Categories, Users, Bucket, Files, FOLDERS } from '@duvdu-v1/duvdu';

import 'express-async-errors';
import { UpdateProfileHandler } from './../../types/endpoints/user.endpoints';

export const updateProfileHandler: UpdateProfileHandler = async (req, res, next) => {

  const profile = await Users.findById(req.loggedUser.id);
  if (!profile) 
    return next(new NotFound('no user found'));

  const coverImage = <Express.Multer.File[] | undefined>(req.files as any).coverImage;
  const profileImage = <Express.Multer.File[] | undefined>(req.files as any).profileImage;
  if (req.body.category) {
    const category = await Categories.findById(req.body.category);
    if (!category) return next(new NotFound('category not found'));
  }

  const s3 = new Bucket();
  if (coverImage) {
    await s3.saveBucketFiles(FOLDERS.auth, ...coverImage);
    req.body.coverImage = `${FOLDERS.auth}/${coverImage[0].filename}`;
    if (profile.coverImage) 
      await s3.removeBucketFiles(profile.coverImage);
    Files.removeFiles(req.body.coverImage);
  }
  if (profileImage) {
    await s3.saveBucketFiles(FOLDERS.auth, ...profileImage);
    req.body.profileImage = `${FOLDERS.auth}/${profileImage[0].filename}`;
    if (profile.profileImage) 
      await s3.removeBucketFiles(profile.profileImage);
    Files.removeFiles(req.body.profileImage);
  }

  const user = await Users.findByIdAndUpdate(req.loggedUser?.id, req.body , {new:true});
  if (!user) return next(new BadRequestError('cannot update this user'));

  res.status(200).json({ message: 'success' , data:user });
};
