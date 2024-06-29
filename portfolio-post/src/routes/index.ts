import { Application } from 'express';

import { router as contractRoutes } from './contract.routes';
import { router as projectRoutes } from './project.routes';

export const mountRoutes = (app: Application) => {
  app.use('/api/projects', projectRoutes);
  app.use('/api/projects/contract', contractRoutes);
};
