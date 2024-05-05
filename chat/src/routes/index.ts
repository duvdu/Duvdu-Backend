import { Application } from 'express';

import { router as messageRoutes } from './message.routes';
import { router as notificationRoutes } from './notification.routes';



export const moutnRoutes = (app:Application)=>{
  app.use('/api/message', messageRoutes);
  app.use('/api/notification', notificationRoutes);
};

