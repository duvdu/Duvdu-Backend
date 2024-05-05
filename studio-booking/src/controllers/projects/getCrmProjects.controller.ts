import 'express-async-errors';

import { IstudioBooking, PaginationResponse, studioBooking } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getCrmProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IstudioBooking[] }>
> = async (req, res) => {
  const resultCount = await studioBooking.countDocuments({
    ...req.pagination.filter,
    isDeleted: { $ne: true },
  });
  
  const studioBookings = await studioBooking.aggregate([
    {
      $match: req.pagination.filter
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $limit: req.pagination.limit
    },
    {
      $skip: req.pagination.skip
    },
    {
      $addFields: {
        subCategory: {
          $cond: {
            if: { $eq: ['ar', req.lang] },
            then: '$subCategory.ar',
            else: '$subCategory.en'
          }
        },
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: {
              $cond: {
                if: { $eq: ['ar', req.lang] },
                then: '$$tag.ar',
                else: '$$tag.en'
              }
            }
          }
        }
      }
    }
  ]);
    

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: studioBookings,
  });
};
