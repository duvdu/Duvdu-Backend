import 'express-async-errors';
import { Ticket } from '../../models/Ticket.model';
import { GetTicketsHandler } from '../../types/endpoints/ticket.endpoints';




export const getTicketsHandler:GetTicketsHandler = async (req,res)=>{
  const tickets = await Ticket.find({}, 'message name phoneNumber userId');
  res.status(200).json({message:'success' , data:tickets});
};