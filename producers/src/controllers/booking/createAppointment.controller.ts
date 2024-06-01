import 'express-async-errors';

import { BadRequestError, NotAllowedError, NotFound, ProducerBooking } from '@duvdu-v1/duvdu';

import { CreateAppointmentBookingHandler } from '../../types/endpoints';



export const createAppointmentBooking:CreateAppointmentBookingHandler = async (req,res,next)=>{
  const booking = await ProducerBooking.findById(req.params.contractId);
  if (!booking) 
    return next(new NotFound({en:'contract not found' , ar:'العقد غير موجود'} , req.lang));

  if (booking.user.toString() != req.loggedUser?.id) 
    return next(new NotAllowedError(undefined , req.lang));

  if (booking.status != 'accepted') 
    return next(new BadRequestError({en:'invalid contract status' , ar:'حالة العقد غير صالحة'} , req.lang));

  booking.appoinment = req.body.appoinment;
  booking.status = 'appoinment pending';
  await booking.save();
  res.status(200).json({message:'success' , data:booking});

};