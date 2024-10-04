import { IProducerPlatform, PaginationResponse, ProducerPlatform } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const getCrmPlatformsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IProducerPlatform[] }>,
  unknown,
  unknown
> = async (req, res) => {
  const platforms = await ProducerPlatform.find(req.pagination.filter)
    .sort({ createdAt: -1 })
    .skip(req.pagination.skip)
    .limit(req.pagination.limit);

  const resultCount = await ProducerPlatform.countDocuments(req.pagination.filter);

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: platforms,
  });
};
