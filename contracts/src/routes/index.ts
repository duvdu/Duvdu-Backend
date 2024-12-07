import { isauthenticated } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import { complaintRoutes } from './complaint.routes';
import { router as couponRoutes } from './coupon.routes';
import { router as subscribeRoutes } from './subscribe.routes';
import * as controllers from '../controllers';
import { contractAnalysis } from '../controllers/analysis.controller';
import * as val from '../validator/contract.validator';

const router = Router();
router.get('/analysis', contractAnalysis);
router.use('/subscribe', subscribeRoutes);
router.route('/').get(isauthenticated, val.getContracts, controllers.getContracts);
router.use('/complaints', complaintRoutes);
router.use('/coupons', couponRoutes);

router
  .route('/:contractId')
  .get(isauthenticated, val.getContract, controllers.getContract)
  .patch(isauthenticated, val.acceptFiles, controllers.acceptFilesController);

export const apiRoutes = router;
