import { NotFound } from '@duvdu-v1/duvdu';

import { Ticket } from '../../models/Ticket.model';
import { UpdateTicketHandler } from '../../types/endpoints/ticket.endpoints';


export const ipdateTicketHandler:UpdateTicketHandler = async(req,res,next)=>{
  const updateTicket = await Ticket.findOneAndUpdate(
    {
      id:req.params.ticketId,
      userId:req.loggedUser?.id
    },
    req.body,
    {new:true}
  );
  if (!updateTicket) return next(new NotFound('ticket not found'));

  res.status(200).json({message:'success'});
};