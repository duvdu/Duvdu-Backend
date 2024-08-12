import { Coupon, ICoupon, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const getCrmCouponHandler: RequestHandler<
  { couponId: string },
  SuccessResponse<{ data: ICoupon }>,
  unknown,
  unknown
> = async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.couponId);

  if (!coupon)
    return next(
      new NotFound({ en: 'coupon not found', ar: 'لم يتم العثور على القسيمة' }, req.lang),
    );

  res.status(200).json({ message: 'success', data: coupon });
};
