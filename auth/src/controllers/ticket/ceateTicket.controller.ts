import { Ticket } from '../../models/Ticket.model';
import { CreateTicketHandler } from '../../types/endpoints/ticket.endpoints';



export const createTicketHandler:CreateTicketHandler = async (req,res)=>{
  await Ticket.create(req.body);
  res.status(200).json({message:'success'});
};