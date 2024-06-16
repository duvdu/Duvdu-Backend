import { Application } from 'express';

import { router as producerRoutes } from './producer.routes';

export const mountRoutes = async (app:Application)=>{
  app.use('/api/producers/producer' , producerRoutes);
};