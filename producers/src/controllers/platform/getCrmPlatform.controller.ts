import { IProducerPlatform, NotFound, ProducerPlatform, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const getCrmPlatformHandler: RequestHandler<
  { platformId: string },
  SuccessResponse<{ data: IProducerPlatform }>,
  unknown,
  unknown
> = async (req, res, next) => {
  const platform = await ProducerPlatform.findById(req.params.platformId);
  if (!platform)
    return next(
      new NotFound({ en: 'platform not found', ar: 'لم يتم العثور على المنصة' }, req.lang),
    );

  res.status(200).json({ message: 'success', data: platform });
};
