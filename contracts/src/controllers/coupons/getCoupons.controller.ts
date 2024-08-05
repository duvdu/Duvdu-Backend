import { Coupon, ICoupon, MODELS, PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const getCouponsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    searchKeywords?: string[];
    startDate?: Date;
    endDate?: Date;
    minValue?: number;
    maxValue?: number;
    minPercentage?: number;
    maxPercentage?: number;
    promoCode?: string;
  }
> = async (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.searchKeywords?.length) {
    req.pagination.filter.$or = req.query.searchKeywords.map((keyword) => ({
      $or: [
        { 'title.en': { $regex: keyword, $options: 'i' } },
        { 'title.ar': { $regex: keyword, $options: 'i' } },
        { promoCode: { $regex: keyword, $options: 'i' } },
      ],
    }));
  }

  if (req.query.startDate || req.query.endDate) {
    req.pagination.filter.start = {};
    req.pagination.filter.end = {};
    if (req.query.startDate) {
      req.pagination.filter.start.$gte = req.query.startDate;
    }
    if (req.query.endDate) {
      req.pagination.filter.end.$lte = req.query.endDate;
    }
  }

  if (req.query.minValue || req.query.maxValue) {
    req.pagination.filter.value = {};
    if (req.query.minValue) {
      req.pagination.filter.value.$gte = req.query.minValue;
    }
    if (req.query.maxValue) {
      req.pagination.filter.value.$lte = req.query.maxValue;
    }
  }

  if (req.query.minPercentage || req.query.maxPercentage) {
    req.pagination.filter.percentage = {};
    if (req.query.minPercentage) {
      req.pagination.filter.percentage.$gte = req.query.minPercentage;
    }
    if (req.query.maxPercentage) {
      req.pagination.filter.percentage.$lte = req.query.maxPercentage;
    }
  }

  if (req.query.promoCode) {
    req.pagination.filter.promoCode = { $regex: req.query.promoCode, $options: 'i' };
  }

  next();
};

export const getCouponsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: ICoupon[] }>,
  unknown,
  unknown
> = async (req, res) => {
  const coupons = await Coupon.aggregate([
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
      $lookup: {
        from: MODELS.user,
        localField: 'users.user',
        foreignField: '_id',
        as: 'usersDetails',
      },
    },
    {
      $addFields: {
        users: {
          $map: {
            input: '$users',
            as: 'userObj',
            in: {
              $mergeObjects: [
                '$$userObj',
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$usersDetails',
                        as: 'userDetail',
                        cond: { $eq: ['$$userDetail._id', '$$userObj.user'] },
                      },
                    },
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        'users.profileImage': {
          $concat: [process.env.BUCKET_HOST, '/', '$users.profileImage'],
        },
      },
    },
    {
      $project: {
        'users.user.name': 1,
        'users.user.userName': 1,
        'users.user.profileImage': 1,
        title: `$title.${req.lang}`,
        promoCode: 1,
        start: 1,
        end: 1,
        couponCount: 1,
        userCount: 1,
        value: 1,
        percentage: 1,
        'users.count': 1,
      },
    },
  ]);

  const resultCount = await Coupon.countDocuments(req.pagination.filter);

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: coupons,
  });
};
