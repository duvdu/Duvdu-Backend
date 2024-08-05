import { Coupon, ICoupon, MODELS, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';

export const getCouponHandler: RequestHandler<
  { couponId: string },
  SuccessResponse<{ data: ICoupon }>,
  unknown,
  unknown
> = async (req, res, next) => {
  const coupons = await Coupon.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.params.couponId) },
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

  if (coupons.length === 0)
    return next(
      new NotFound({ en: 'coupon not found', ar: 'لم يتم العثور على القسيمة' }, req.lang),
    );

  res.status(200).json({ message: 'success', data: coupons[0] });
};
