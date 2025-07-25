import { isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/payment';
import * as validators from '../validators/payment';

export const router = express.Router();

router.get(
  '/transactions-analysis',
  isauthenticated,
  isauthorized(PERMISSIONS.listPaymentAnalysis),
  validators.transactionAnalysisValidator,
  controllers.transactionsAnalysisController,
);

router.get(
  '/subscriptions-analysis',
  isauthenticated,
  isauthorized(PERMISSIONS.listPaymentAnalysis),
  validators.transactionAnalysisValidator,
  controllers.subscriptionAnalysisController,
);
