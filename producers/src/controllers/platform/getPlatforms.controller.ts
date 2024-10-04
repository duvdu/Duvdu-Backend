import { IProducerPlatform, PaginationResponse, ProducerPlatform } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const getProducerPlatformsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
  }
> = async (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.search) {
    const searchRegex = { $regex: req.query.search, $options: 'i' };
    req.pagination.filter['$or'] = [{ 'name.ar': searchRegex }, { 'name.en': searchRegex }];
  }

  next();
};

export const getPlatformsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IProducerPlatform[] }>,
  unknown,
  unknown
> = async (req, res) => {
  const platform = await ProducerPlatform.aggregate([
    {
      $match: req.pagination.filter,
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: req.pagination.skip,
    },
    {
      $limit: req.pagination.limit,
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

  const resultCount = await ProducerPlatform.countDocuments(req.pagination.filter);

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: platform,
  });
};
