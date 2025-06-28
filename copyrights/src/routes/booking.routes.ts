import { isauthenticated, globalUploadMiddleware, FOLDERS } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import {
  askForNewDeadline,
  respondToNewDeadline,
} from '../controllers/booking/askForNewDeadline.controller';
import { contractAction } from '../controllers/booking/contract-action.controller';
import { createContractHandler } from '../controllers/booking/contract-create.controller';
import { payContract } from '../controllers/booking/contract-pay.controller';
import { updateContractHandler } from '../controllers/booking/contract-update.controller';
import * as val from '../validators/booking/booking.validator';
const router = Router();

router.get('/pay/:contractId', isauthenticated, val.pay, payContract);

router.post(
  '/:projectId',
  isauthenticated,
  globalUploadMiddleware(FOLDERS.copyrights, {
    maxSize: 50 * 1024 * 1024,
    fileTypes: ['image/*', 'video/*', 'application/*', 'text/*'],
  }).array('attachments', 10),
  val.bookProject,
  createContractHandler,
);

router.post('/:contractId/action', isauthenticated, val.action, contractAction);

router.patch('/:contractId', isauthenticated, val.updateContract, updateContractHandler);

router.post(
  '/:contractId/ask-for-new-deadline',
  isauthenticated,
  val.askForNewDeadline,
  askForNewDeadline,
);

router.patch(
  '/:contractId/respond-to-new-deadline',
  isauthenticated,
  val.respondToNewDeadline,
  respondToNewDeadline,
);

export const bookingRoutes = router;
