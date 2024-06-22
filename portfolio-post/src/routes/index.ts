import { Application } from 'express';

import { router as projectRoutes } from './project.routes';

export const mountRoutes = (app:Application)=>{
  app.use('/api/portfolio-post' , projectRoutes);
};