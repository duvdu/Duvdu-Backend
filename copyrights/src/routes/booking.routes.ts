import { isauthenticated, globalUploadMiddleware, FOLDERS } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import {
  contractAction,
  createContractHandler,
  payContract,
} from '../controllers/booking/copyright-contract.controller';
import * as val from '../validators/booking/booking.validator';

const router = Router();

router.get('/pay/:paymentSession', val.pay, payContract);

router.post(
  '/:projectId',
  isauthenticated,
  // isauthorized(PERMISSIONS.booking),
  globalUploadMiddleware(FOLDERS.copyrights, {
    maxSize: 50 * 1024 * 1024,
    fileTypes: ['image', 'video', 'application/pdf', 'text/plain'],
  }).array('attachments', 10),
  val.bookProject,
  // bookProjectHandler,
  createContractHandler,
);

router.post('/:contractId/action', isauthenticated, val.action, contractAction);
// router.patch(
//   '/:bookingId',
//   isauthenticated,
//   isauthorized(PERMISSIONS.booking),
//   val.updateProject,
//   updateBookedProjectHandler,
// );

export const bookingRoutes = router;
