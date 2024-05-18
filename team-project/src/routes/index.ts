import { Application } from 'express';

import { router as teamRoutes } from './teamProject.routes';



export const moutnRoutes = (app:Application)=>{
  app.use('/api/teamproject', teamRoutes);
};