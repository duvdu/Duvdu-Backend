import { BadRequestError, Bucket, SuccessResponse, Users, redisClient } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateDefaultProfileCrm: RequestHandler<
  unknown,
  SuccessResponse<{ data: { url: string } }>
> = async (req, res, next) => {
  if (!req.file) return next(new BadRequestError(undefined , req.lang));
  const bucket = new Bucket();
  // TODO: remove last image
  await bucket.saveBucketFiles('defaults', req.file);
  const oldDefaultProfile = (await redisClient.get('default_profile')) || 'defaults/profile.jpg';
  await bucket.removeBucketFiles(oldDefaultProfile);
  await redisClient.set('default_profile', 'defaults/' + req.file.filename);

  await Users.updateMany(
    { profileImage: oldDefaultProfile },
    { profileImage: 'defaults/' + req.file.filename },
  );
  res.status(200).json({
    message: 'success',
    data: { url: process.env.BUCKET_HOST + '/defaults/' + req.file.filename },
  });
};
