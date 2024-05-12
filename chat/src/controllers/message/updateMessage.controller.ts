import 'express-validator';
import { BadRequestError, Message, NotFound, UnauthorizedError } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

import { UpdateMessageHandler } from '../../types/endpoints/mesage.endpoints';




export const updateMessageHandler:UpdateMessageHandler = async (req,res,next)=>{
  const message = await Message.findById(req.params.message);
  if (!message)
    return next(new NotFound(`message not found ${req.params.message}`));

  if ([message.sender , message.receiver].includes(new Types.ObjectId(req.loggedUser.id))) 
    return next(new UnauthorizedError(`user not implementied in this chat ${req.loggedUser.id}`));

  if (req.body.reactions) 
    req.body.reactions[0].user = new Types.ObjectId(req.loggedUser.id);

  const updatedMessage = await Message.findByIdAndUpdate(req.params.message , req.body , {new:true});
  if (!updatedMessage) 
    return next(new BadRequestError(`failed to update this message ${req.params.message}`));
  res.status(200).json({message:'success' , data:updatedMessage});
};