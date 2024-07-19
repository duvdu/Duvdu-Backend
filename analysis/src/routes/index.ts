import { Application } from 'express';

import { router as contractRoutes } from './contract.routes';
import { router as homeRoutes } from './home.routes';
import { router as projectReview } from './projectReviews.routes';
import { router as rankRoutes } from './rank.routes';
import { router as settingRoutes } from './setting.routes';


export const mountRoutes = (app:Application)=>{
  app.use('/api/analysis/rank' , rankRoutes);
  app.use('/api/analysis/home' , homeRoutes);
  app.use('/api/analysis/setting' , settingRoutes);
  app.use('/api/analysis/contract-review' , contractRoutes);
  app.use('/api/analysis/project-review' , projectReview);

};