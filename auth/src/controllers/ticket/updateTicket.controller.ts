import 'express-async-errors';
import { NotFound } from '@duvdu-v1/duvdu';

import { Ticket } from '../../models/Ticket.model';
import { UpdateTicketHandler } from '../../types/endpoints/ticket.endpoints';


export const updateTicketHandler:UpdateTicketHandler = async(req,res,next)=>{
  const updateTicket = await Ticket.findByIdAndUpdate(
    req.params.ticketId,
    { $set: { 'state.isClosed': true, 'state.closedBy': req.loggedUser?.id, 'state.feedback': req.body.state.feedback } },
    {new:true}
  );
  
  if (!updateTicket) return next(new NotFound('ticket not found'));

  res.status(200).json({message:'success'});
};