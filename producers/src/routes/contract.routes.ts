import {
  checkRequiredFields,
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/contract';
import * as val from '../validators/contract/contract.val';

export const router = express.Router();

router.use(isauthenticated);

router
  .route('/')
  .post(
    globalUploadMiddleware(FOLDERS.producer, {
      fileTypes: ['image/*', 'application/*', 'video/*'],
    }).fields([{ name: 'attachments', maxCount: 10 }]),
    val.createContractVal,
    checkRequiredFields({ fields: ['attachments'] }),
    handler.createContractHandler,
  )
  .get(globalPaginationMiddleware, handler.getContractsPagination, handler.getContractsHandler);

router
  .route('/:contractId')
  .patch(val.updateContractVal, handler.updateContractHandler)
  .get(val.getContractVal, handler.getContarctHandler);
