import 'express-async-errors';

import { BadRequestError, NotAllowedError, NotFound, ProducerBooking } from '@duvdu-v1/duvdu';

import { CreateAppointmentBookingHandler } from '../../types/endpoints';



export const createAppointmentBooking:CreateAppointmentBookingHandler = async (req,res,next)=>{
  const booking = await ProducerBooking.findById(req.params.contractId);
  if (!booking) 
    return next(new NotFound('contract not found'));

  if (booking.user.toString() != req.loggedUser?.id) 
    return next(new NotAllowedError(`this user ${req.loggedUser?.id} not owner for this contract ${req.params.contractId}`));

  if (booking.status != 'accepted') 
    return next(new BadRequestError('invalid contract status'));

  booking.appoinment = req.body.appoinment;
  booking.status = 'appoinment pending';
  await booking.save();
  res.status(200).json({message:'success' , data:booking});

};