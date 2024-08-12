import { Coupon, ICoupon, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const createCouponHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: ICoupon }>,
  Partial<
    Pick<
      ICoupon,
      'couponCount' | 'promoCode' | 'start' | 'end' | 'title' | 'userCount' | 'value' | 'percentage'
    >
  >,
  unknown
> = async (req, res) => {
  const coupon = await Coupon.create({...req.body , couponCountAvaliable:req.body.couponCount});
  res.status(201).json({ message: 'success', data: coupon });
};
