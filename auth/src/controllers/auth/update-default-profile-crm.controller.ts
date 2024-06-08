import { BadRequestError, Bucket, SuccessResponse, Users, redisClient } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateDefaultImagesCrm: RequestHandler<
  unknown,
  SuccessResponse<{ data: { url: string } }>
> = async (req, res, next) => {
  if (!req.files) return next(new BadRequestError(undefined, req.lang));
  const profileImage: Express.Multer.File | undefined = (req.files as any).profile?.[0];
  const coverImage: Express.Multer.File | undefined = (req.files as any).cover?.[0];

  const bucket = new Bucket();

  if (profileImage) {
    await bucket.saveBucketFiles('defaults', profileImage);
    const oldDefaultProfile = (await redisClient.get('default_profile')) || 'defaults/profile.jpg';
    await bucket.removeBucketFiles(oldDefaultProfile);
    await redisClient.set('default_profile', 'defaults/' + profileImage.filename);
    await Users.updateMany(
      { profileImage: oldDefaultProfile },
      { profileImage: 'defaults/' + profileImage.filename },
    );
  }
  if (coverImage) {
    await bucket.saveBucketFiles('defaults', coverImage);
    const oldDefaultCover = (await redisClient.get('default_cover')) || 'defaults/cover.jpg';
    await bucket.removeBucketFiles(oldDefaultCover);
    await redisClient.set('default_cover', 'defaults/' + coverImage.filename);
    await Users.updateMany(
      { coverImage: oldDefaultCover },
      { coverImage: 'defaults/' + coverImage.filename },
    );
  }

  res.status(200).json({
    message: 'success',
    data: {
      url:
        process.env.BUCKET_HOST +
          '/defaults/' +
          (coverImage ? coverImage?.filename : profileImage?.filename) || '',
    },
  });
};
