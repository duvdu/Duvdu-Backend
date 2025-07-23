import {
  checkRequiredFields,
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import express from 'express';


  
import * as controller from '../controllers/fundTransactions';
import * as validation from '../validators/fundedTransactions.validation';


export const router = express.Router();
router.use(isauthenticated);


router
  .route('/crm')
  .post(
    isauthorized(PERMISSIONS.createFundTransactions),
    globalUploadMiddleware(FOLDERS.transactions, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['video/*', 'image/*', 'audio/*', 'application/*'],
    }).fields([{ name: 'fundAttachment', maxCount: 1 }]),
    checkRequiredFields({ fields: ['fundAttachment'] }),
    validation.createFundedTransactionValidation,
    controller.createFundTransactions,
  )
  .get(
    isauthorized(PERMISSIONS.listFundTransactions),
    globalPaginationMiddleware,
    validation.getFundingTransactionPaginationValidation,
    controller.getFundingTransactionPagination,
    controller.getFundingTransactions,
  );


router
  .route('/crm/:transactionId')
  .get(
    isauthorized(PERMISSIONS.listFundTransactions),
    validation.getFundingTransactionValidation,
    controller.getFundingTransaction,
  );