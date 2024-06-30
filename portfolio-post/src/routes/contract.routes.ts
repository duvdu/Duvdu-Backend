import {
  checkRequiredFields,
  FOLDERS,
  globalUploadMiddleware,
  isauthenticated,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/book';
import * as val from '../validators/book.val';

export const router = express.Router();

router.route('/:projectId').post(
  isauthenticated,
  globalUploadMiddleware(FOLDERS.portfolio_post, {
    maxSize: 100 * 1024 * 1024,
    fileTypes: ['video', 'image'],
  }).fields([{ name: 'attachments', maxCount: 10 }]),
  val.create,
  checkRequiredFields({ fields: ['attachments'] }),
  handler.createContractHandler,
);
router.get('/pay/:paymentSession', val.pay, handler.payContract);

router.route('/:contractId/contract').patch(isauthenticated , val.update , handler.updateContractHandler);
router.route('/:contractId/action').post(isauthenticated , val.action , handler.contractActionHandler);