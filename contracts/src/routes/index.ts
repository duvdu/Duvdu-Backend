import { Router } from 'express';

import { router as complaintRoutes } from './complaint.routes';
import { router as contractCancelRoutes } from './contractCancel.routes';
import { router as contractFilesRoutes } from './contractFiles.routes';
import { router as contractRoutes } from './contracts.routes';
import { router as couponRoutes } from './coupon.routes';
import { router as subscribeRoutes } from './subscribe.routes';

const router = Router();

router.use('/', contractRoutes);
router.use('/subscribe', subscribeRoutes);
router.use('/complaints', complaintRoutes);
router.use('/coupons', couponRoutes);
router.use('/contractFiles', contractFilesRoutes);
router.use('/contractCancel', contractCancelRoutes);

export const apiRoutes = router;
