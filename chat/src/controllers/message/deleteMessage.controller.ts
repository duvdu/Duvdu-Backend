import 'express-async-errors';
import { Bucket, NotFound, UnauthorizedError } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

import { Message } from '../../models/message.model';
import { DeleteMessageHandler } from '../../types/endpoints';



export const deleteMessageHandler:DeleteMessageHandler = async (req,res,next)=>{
  const message = await Message.findById(req.params.message);
  if (!message) 
    return next(new NotFound(`message not found ${req.params.message}`));

  if ([message.sender , message.receiver].includes(new Types.ObjectId(req.loggedUser.id))) 
    return next(new UnauthorizedError(`user dont owner for this message ${req.params.message}`));

  if (message.media?.url) {
    const s3 = new Bucket();
    await s3.removeBucketFiles(message.media.url);
  }

  await Message.findByIdAndDelete(req.params.message);
  res.status(204).json({message:'success'});
};