import { Application } from 'express';

import { router as messageRoutes } from './message.routes';



export const moutnRoutes = (app:Application)=>{
  app.use('/api/message', messageRoutes);
};

