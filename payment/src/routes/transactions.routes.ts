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

import * as transactionsControllers from '../controllers/transactions';
import * as transactionsValidators from '../validators/transactions.validation';

export const router = express.Router();

// router.use(isauthenticated);

router
  .route('/crm')
  .get(
    globalPaginationMiddleware,
    // isauthorized(PERMISSIONS.listTransactions),
    transactionsValidators.transactionPaginationValidation,
    transactionsControllers.transactionPagination,
    transactionsControllers.getAllTransactions,
  );
router
  .route('/crm/:transactionId')
  .get(
    isauthorized(PERMISSIONS.listTransactions),
    transactionsValidators.getOneTransaction,
    transactionsControllers.getOneTransaction,
  )
  .patch(
    isauthorized(PERMISSIONS.fundTransactions),
    globalUploadMiddleware(FOLDERS.transactions, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['video/*', 'image/*', 'audio/*', 'application/*'],
    }).fields([{ name: 'fundAttachment', maxCount: 1 }]),
    checkRequiredFields({ fields: ['fundAttachment'] }),
    transactionsValidators.fundTransactionValidation,
    transactionsControllers.fundTransactions,
  );

router
  .route('/user')
  .get(
    globalPaginationMiddleware,
    transactionsValidators.userTransactionPaginationValidation,
    transactionsControllers.userTransactionPagination,
    transactionsControllers.getUserTransactions,
  );
