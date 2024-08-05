import { Coupon, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const deleteCouponHandler: RequestHandler<
  { couponId: string },
  SuccessResponse,
  unknown,
  unknown
> = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.couponId);
  res.status(204).json({ message: 'success' });
};
