import {
  Bucket,
  Files,
  FOLDERS,
  IProducerPlatform,
  NotFound,
  ProducerPlatform,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const updatePlatformHandler: RequestHandler<
  { platformId: string },
  SuccessResponse<{ data: IProducerPlatform }>,
  Partial<Pick<IProducerPlatform, 'image' | 'name'>>,
  unknown
> = async (req, res, next) => {
  const image = <Express.Multer.File[] | undefined>(req.files as any).image;

  const platform = await ProducerPlatform.findById(req.params.platformId);
  if (!platform)
    return next(
      new NotFound({ en: 'platform not found', ar: 'لم يتم العثور على المنصة' }, req.lang),
    );

  const s3 = new Bucket();
  if (image && image.length > 0) {
    await s3.saveBucketFiles(FOLDERS.producer, ...image);
    await s3.removeBucketFiles(platform.image);
    req.body.image = `${FOLDERS.producer}/${image[0].filename}`;
    Files.removeFiles(req.body.image);
  }

  if (req.body.name) platform.name = req.body.name;

  await platform.save();
  res.status(200).json({ message: 'success', data: platform });
};
