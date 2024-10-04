import { IProducerPlatform, NotFound, ProducerPlatform, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';

export const getPlatformHandler: RequestHandler<
  { platformId: string },
  SuccessResponse<{ data: IProducerPlatform }>,
  unknown,
  unknown
> = async (req, res, next) => {
  const platform = await ProducerPlatform.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.params.platformId) },
    },
    {
      $project: {
        _id: 1,
        image: {
          $concat: [process.env.BUCKET_HOST, '/', '$image'],
        },
        name: `$name.${req.lang}`,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  if (platform.length === 0)
    return next(
      new NotFound({ en: 'platform not found', ar: 'لم يتم العثور على المنصة' }, req.lang),
    );

  res.status(200).json({ message: 'success', data: platform[0] });
};
