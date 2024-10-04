import { Application } from 'express';

import { router as contractRoutes } from './contract.routes';
import { router as platformsRoutes } from './platform.routes';
import { router as producerRoutes } from './producer.routes';

export const mountRoutes = async (app: Application) => {
  app.use('/api/producers/producer', producerRoutes);
  app.use('/api/producers/contract', contractRoutes);
  app.use('/api/producers/platforms', platformsRoutes);
};
