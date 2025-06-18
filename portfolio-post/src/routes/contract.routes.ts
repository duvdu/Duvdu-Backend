import { FOLDERS, globalUploadMiddleware, isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/book';
import * as val from '../validators/book.val';

export const router = express.Router();

router.get('/paymob-test', handler.paymobTest);
router.get('/paymob-webhook', handler.responseWebhook);

router.use(isauthenticated);

router.route('/:projectId').post(
  globalUploadMiddleware(FOLDERS.portfolio_post, {
    maxSize: 100 * 1024 * 1024,
    fileTypes: ['video/*', 'image/*'],
  }).fields([{ name: 'attachments', maxCount: 10 }]),
  val.create,
  handler.createContractHandler,
);
router.post('/pay/:paymentSession', val.pay, handler.payContract);

router.route('/:contractId/contract').patch(val.update, handler.updateContractHandler);
router.route('/:contractId/action').post(val.action, handler.contractActionHandler);
router
  .route('/:contractId/ask-for-new-deadline')
  .post(val.askForNewDeadline, handler.askForNewDeadline);
router
  .route('/:contractId/respond-to-new-deadline')
  .patch(val.respondToNewDeadline, handler.respondToNewDeadline);
