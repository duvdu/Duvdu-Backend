import { NotFound } from '@duvdu-v1/duvdu';

import { Ticket } from '../../models/Ticket.model';
import { GetUserTicketsHandler } from '../../types/endpoints/ticket.endpoints';



export const getUserTickets:GetUserTicketsHandler = async(req,res,next)=>{
  const tickets = await Ticket.find({userId:req.loggedUser?.id});

  if (tickets.length === 0) return next(new NotFound('tickets not found'));
  res.status(200).json({message:'success' , data:tickets});
};