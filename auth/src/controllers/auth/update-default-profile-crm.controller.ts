import {
  BadRequestError,
  Bucket,
  SuccessResponse,
  Users,
  redisClient,
  Setting,
} from '@duvdu-v1/duvdu';
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
    const appSettings = await Setting.findOneAndUpdate(
      {},
      { default_profile: 'defaults/' + profileImage.filename },
    );
    if (!appSettings) throw new Error('app settings not found');
    await bucket.removeBucketFiles(appSettings?.default_profile);
    await Users.updateMany(
      { profileImage: appSettings?.default_profile },
      { profileImage: 'defaults/' + profileImage.filename },
    );
  }
  if (coverImage) {
    await bucket.saveBucketFiles('defaults', coverImage);
    const appSettings = await Setting.findOneAndUpdate(
      {},
      { default_cover: 'defaults/' + coverImage.filename },
    );
    if (!appSettings) throw new Error('app settings not found');
    await bucket.removeBucketFiles(appSettings?.default_cover);
    await redisClient.set('default_cover', 'defaults/' + coverImage.filename);
    await Users.updateMany(
      { coverImage: appSettings?.default_cover },
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

