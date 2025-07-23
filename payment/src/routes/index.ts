import { Application } from 'express';

import { router as fundingTransactionsRoutes } from './fundingTransactions.routes';
import { router as paymobRoutes } from './paymob.routes';
import { router as transactionsRoutes } from './transactions.routes';

export const mountRoutes = (app: Application) => {
  app.use('/api/payment/funding-transactions', fundingTransactionsRoutes);
  app.use('/api/payment/transactions', transactionsRoutes);
  app.use('/api/payment', paymobRoutes);
};
