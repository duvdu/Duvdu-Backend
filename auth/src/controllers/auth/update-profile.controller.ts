import {
  BadRequestError,
  NotFound,
  Categories,
  Users,
  Bucket,
  Files,
  FOLDERS,
} from '@duvdu-v1/duvdu';

import 'express-async-errors';
import { RequestHandler } from 'express';

export const updateProfileHandler: RequestHandler = async (req, res, next) => {
  const profile = await Users.findById(req.loggedUser.id);
  if (!profile)
    return next(new NotFound({ en: 'no user found', ar: 'المستخدم غير موجود' }, req.lang));

  const coverImage = <Express.Multer.File[] | undefined>(req.files as any).coverImage || [];
  const profileImage = <Express.Multer.File[] | undefined>(req.files as any).profileImage || [];

  const s3 = new Bucket();
  if (coverImage?.length) {
    await s3.saveBucketFiles(FOLDERS.auth, ...coverImage);
    req.body.coverImage = `${FOLDERS.auth}/${coverImage[0].filename}`;
    if (profile.coverImage && !profile.coverImage.startsWith('defaults'))
      await s3.removeBucketFiles(profile.coverImage);
    Files.removeFiles(req.body.coverImage);
  }
  if (profileImage?.length) {
    await s3.saveBucketFiles(FOLDERS.auth, ...profileImage);
    req.body.profileImage = `${FOLDERS.auth}/${profileImage[0].filename}`;
    if (profile.profileImage && !profile.profileImage.startsWith('defaults'))
      await s3.removeBucketFiles(profile.profileImage);
    Files.removeFiles(req.body.profileImage);
  }

  if (req.body.location)
    req.body.location = {
      type: 'Point',
      coordinates: [(req as any).body.location.lng, (req as any).body.location.lat],
    } as any;

  const user = await Users.findByIdAndUpdate(req.loggedUser?.id, req.body, { new: true })
    .populate([{ path: 'categories', select: 'title' }])
    .lean();
  if (!user)
    return next(
      new BadRequestError(
        { en: 'cannot update this user', ar: 'لا يمكن تحديث هذا المستخدم' },
        req.lang,
      ),
    );

  if (user.profileImage) user.profileImage = `${process.env.BUCKET_HOST}/${user.profileImage}`;

  if (user.coverImage) user.coverImage = `${process.env.BUCKET_HOST}/${user.coverImage}`;

  res.status(200).json({ message: 'success', data: user });
};
