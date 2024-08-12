import { BadRequestError, Contracts, Coupon, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';

export const applyCouponHandler: RequestHandler<
  { contractId: string },
  SuccessResponse,
  { coupon: string },
  unknown
> = async (req, res, next) => {
  const contract = await Contracts.findOne({contract:req.params.contractId});
  if (!contract) 
    return next(new NotFound({en:'contract not found' , ar:'لم يتم العثور على العقد'}));

  const coupon = await Coupon.findById(req.body.coupon);
  if (!coupon) 
    return next(new NotFound({en:'coupon not found' , ar:'لم يتم العثور على القسيمة'} , req.lang));

  if (coupon.expired) 
    return next(new BadRequestError({en:'coupon expired' , ar:'انتهت صلاحية القسيمة'} , req.lang));

  if (!(new Date(coupon.start) >= new Date())) 
    return next(new BadRequestError({en:`coupon not start yet can use it in ${coupon.start}` , ar:`لم تبدأ القسيمة بعد، يمكنك استخدامها في ${coupon.start}`}));

  if (new Date(coupon.end) < new Date()) {
    coupon.expired = true;
    await coupon.save();
    return next(new BadRequestError({en:'coupon expired' , ar:'انتهت صلاحية القسيمة'} , req.lang));
  }

  if (coupon.couponCountAvaliable === 0) 
    return next(new BadRequestError({en:'The coupon has exceeded the maximum usage limit.' , ar:'القسيمة تعدت الحد الاقصى من الاستخدام'} , req.lang));

  const user = coupon.users.findIndex((el:any)=> el.user.toString() === req.loggedUser.id);

  if (!user) 
    coupon.users.push({user:new mongoose.Types.ObjectId(req.loggedUser.id) , count:1});

  coupon.couponCountAvaliable--;

};
