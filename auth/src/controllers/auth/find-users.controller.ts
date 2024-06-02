import { Iuser, MODELS, PaginationResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

export const filterUsers: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    username?: string;
    phoneNumber?: string;
    category?: string;
    priceFrom?: number;
    priceTo?: number;
    hasVerificationPadge?: boolean;
    isBlocked?: boolean;
  }
> = (req, res, next) => {
  if (req.query.search) req.pagination.filter.$text = { $search: req.query.search };
  if (req.query.username) req.pagination.filter.username = req.query.username;
  if (req.query.phoneNumber) req.pagination.filter['phoneNumber.number'] = req.query.phoneNumber;
  if (req.query.category) req.pagination.filter.category = req.query.category;
  if (req.query.priceFrom) req.pagination.filter.price = { $gte: req.query.priceFrom };
  if (req.query.priceTo)
    req.pagination.filter.price = { ...req.pagination.filter.price, $lte: req.query.priceTo };
  if (req.query.hasVerificationPadge !== undefined)
    req.pagination.filter.hasVerificationBadge = req.query.hasVerificationPadge;
  req.pagination.filter['isBlocked.value'] = req.query.isBlocked || false;
  next();
};

export const findUsers: RequestHandler<unknown, PaginationResponse<{ data: Iuser[] }>> = async (
  req,
  res,
) => {
  const count = await Users.countDocuments(req.pagination.filter);

  const aggregationPipeline = [
    {
      $match: req.pagination.filter
    },
    {
      $project: {
        _id:1,
        name: 1,
        username: 1,
        profileImage: { $concat: [process.env.BUCKET_HOST ,'/', '$profileImage'] }, // Prepend BUCKET_HOST to profileImage
        about: 1,
        isOnline: 1,
        isAvaliableToInstantProjects: 1,
        pricePerHour: 1,
        hasVerificationBadge: 1,
        rate: 1,
        followCount:1,
        invalidAddress:1,
        likes:1,
        address:1,
        views:1
      }
    },
    {
      $lookup: {
        from: MODELS.follow,
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$following', '$$userId'] },
                  { $eq: ['$follower', new mongoose.Types.ObjectId(req.loggedUser?.id)] } // Use optional chaining to avoid error if req.loggedUser is undefined
                ]
              }
            }
          }
        ],
        as: 'isFollow'
      }
    },
    {
      $addFields: {
        isFollow: { $cond: { if: { $gt: [{ $size: '$isFollow' }, 0] }, then: true, else: false } }
      }
    },
    {
      $skip: req.pagination.skip
    },
    {
      $limit: req.pagination.limit
    }
  ];
  
  const users = await Users.aggregate(aggregationPipeline);

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount: count,
      totalPages: Math.ceil(count / req.pagination.limit),
    },
    data: users,
  });
};
