import 'express-async-errors';

import { IstudioBooking, MODELS, PaginationResponse, studioBooking } from '@duvdu-v1/duvdu';
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
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $addFields: {
        user: {
          $cond: {
            if: { $eq: [{ $size: '$userDetails' }, 0] },
            then: null,
            else: {
              $arrayElemAt: [
                '$userDetails',
                0
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        user: {
          username: '$user.username',
          profileImage: '$user.profileImage',
          isOnline: '$user.isOnline',
          acceptedProjectsCounter: '$user.acceptedProjectsCounter',
          name: '$user.name',
          rate:'$user.rate'
        },
        attachments: 1,
        cover: 1,
        studioName: 1,
        studioNumber: 1,
        studioEmail: 1,
        desc: 1,
        equipments: 1,
        location: 1,
        searchKeywords: 1,
        pricePerHour: 1,
        insurance: 1,
        showOnHome: 1,
        category: 1,
        cycle: 1,
        rate: 1,
        creatives: 1,
        tags: 1,
        subCategory: 1
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

