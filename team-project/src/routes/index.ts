import { Application } from 'express';

import { router as contractRoutes } from './contract.routes';
import { router as projectRoutes } from './project.routes';

export const mountRoutes = (app: Application) => {
  app.use('/api/team', projectRoutes);
  app.use('/api/team/contract', contractRoutes);
};
