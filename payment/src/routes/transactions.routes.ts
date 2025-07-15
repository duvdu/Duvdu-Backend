import { globalPaginationMiddleware, isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as transactionsControllers from '../controllers/transactions';
import * as transactionsValidators from '../validators/transactions.validation';

export const router = express.Router();

router.use(isauthenticated);

router
  .route('/')
  .get(
    globalPaginationMiddleware,
    transactionsValidators.userTransactionPaginationValidation,
    transactionsControllers.userTransactionPagination,
    transactionsControllers.getUserTransactions,
  );

router
  .route('/crm')
  .get(
    globalPaginationMiddleware,
    transactionsValidators.transactionPaginationValidation,
    transactionsControllers.transactionPagination,
    transactionsControllers.getAllTransactions,
  );

router
  .route('/crm/:transactionId')
  .get(transactionsValidators.getOneTransaction, transactionsControllers.getOneTransaction);
