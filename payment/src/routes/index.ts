import { Application } from 'express';

import { router as paymobRoutes } from './paymob.routes';

export const mountRoutes = (app: Application) => {
  app.use('/api/payment', paymobRoutes);
};
