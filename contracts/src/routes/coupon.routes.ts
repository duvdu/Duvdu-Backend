import { globalPaginationMiddleware, isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/coupons';
import * as val from '../validator/coupon.validator';

export const router = express.Router();

router.use(isauthenticated);
router.route('/crm').get(val.getAll, globalPaginationMiddleware , controllers.getCrmCouponsHandler);
router.route('/crm/:couponId').get(val.getOne, controllers.getCrmCouponHandler);

router
  .route('/')
  .post(val.create, controllers.createCouponHandler)
  .get(val.getAll, globalPaginationMiddleware, controllers.getCouponsHandler);

router
  .route('/:couponId')
  .patch(val.update, controllers.updateCouponHandler)
  .get(val.getOne, controllers.getCouponHandler)
  .delete(val.getOne, controllers.deleteCouponHandler);
