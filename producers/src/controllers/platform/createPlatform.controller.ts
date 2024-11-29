import {
  Bucket,
  FOLDERS,
  IProducerPlatform,
  ProducerPlatform,
  SuccessResponse,
  BadRequestError
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const createPlatformHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: IProducerPlatform }>,
  Pick<IProducerPlatform, 'image' | 'name'>,
  unknown
> = async (req, res, next) => {
  const image = <Express.Multer.File[]>(req.files as any).image;

  if (!image?.length) {
    return next(
      new BadRequestError(
        { en: 'Platform image is required', ar: 'صورة المنصة مطلوبة' },
        'en'
      )
    );
  }

  // Upload image and create platform in parallel
  const [platform] = await Promise.all([
    ProducerPlatform.create({
      ...req.body,
      image: `${FOLDERS.producer}/${image[0].filename}`
    }),
    new Bucket().saveBucketFiles(FOLDERS.producer, ...image)
  ]);

  res.status(201).json({ message: 'success', data: platform });
};
