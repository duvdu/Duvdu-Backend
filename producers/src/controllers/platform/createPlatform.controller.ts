import {
  Bucket,
  Files,
  FOLDERS,
  IProducerPlatform,
  ProducerPlatform,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const createPlatformHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: IProducerPlatform }>,
  Pick<IProducerPlatform, 'image' | 'name'>,
  unknown
> = async (req, res) => {
  const image = <Express.Multer.File[]>(req.files as any).image;
  
  const [platform] = await Promise.all([
    ProducerPlatform.create({
      ...req.body,
      image: `${FOLDERS.producer}/${image[0].filename}`
    }),
    new Bucket().saveBucketFiles(FOLDERS.producer, ...image),
    Files.removeFiles(`${FOLDERS.producer}/${image[0].filename}`)
  ]);

  res.status(201).json({ message: 'success', data: platform });
};
