import { isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/contract';
import * as val from '../validators/projectValidation';

export const router = express.Router();

router.use(isauthenticated);

router.route('/:contractId').post(val.action, controllers.contractAction);
router.post('/pay/:paymentSession', val.pay, controllers.payContract);
router.post(
  '/:contractId/ask-for-new-deadline',
  val.askForNewDeadline,
  controllers.askForNewDeadline,
);
router.post(
  '/:contractId/respond-to-new-deadline',
  val.respondToNewDeadline,
  controllers.respondToNewDeadline,
);
