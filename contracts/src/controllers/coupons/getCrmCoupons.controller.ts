import { Coupon, ICoupon, PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const getCrmCouponsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: ICoupon[] }>,
  unknown,
  unknown
> = async (req, res) => {
  const coupons = await Coupon.find(req.pagination.filter)
    .populate({ path: 'users.user', select: 'userName name profileImage' })
    .sort({ createdAt: -1 })
    .skip(req.pagination.skip)
    .limit(req.pagination.limit);

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
