import { Application } from 'express';

import { router as paymobRoutes } from './paymob.routes';
import { router as transactionsRoutes } from './transactions.routes';

export const mountRoutes = (app: Application) => {
  app.use('/api/payment', paymobRoutes);
  app.use('/api/payment/transactions', transactionsRoutes);
};
