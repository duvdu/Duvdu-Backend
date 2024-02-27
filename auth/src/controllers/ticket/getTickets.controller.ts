import { Ticket } from '../../models/Ticket.model';
import { GetTicketsHandler } from '../../types/endpoints/ticket.endpoints';




export const getTicketsHandler:GetTicketsHandler = async (req,res)=>{
  const tickets = await Ticket.find();
  res.status(200).json({message:'success' , data:tickets});
};