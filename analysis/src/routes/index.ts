import { Application } from 'express';

import { router as homeRoutes } from './home.routes';
import { router as rankRoutes } from './rank.routes';
import { router as settingRoutes } from './setting.routes';


export const mountRoutes = async (app:Application)=>{
  app.use('/api/analysis/rank' , rankRoutes);
  app.use('/api/analysis/home' , homeRoutes);
  app.use('/api/analysis/setting' , settingRoutes);
};