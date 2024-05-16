import { Application } from 'express';

import { router as producerBooking } from './booking.routes';
import { router as producerRouter } from './producer.routes';



export const mountRoutes = (app:Application)=>{
  
  app.use('/api/producers/producer' , producerRouter);
  app.use('/api/producers/book' , producerBooking);
};