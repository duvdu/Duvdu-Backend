import 'express-async-errors';
import { BadRequestError, Bucket } from '@duvdu-v1/duvdu';

import { Message } from '../../models/message.model';
import { DeleteChatHandler } from '../../types/endpoints';




export const deleteChatHandler:DeleteChatHandler = async (req,res,next)=>{

  const messages = await Message.find({receiver:req.params.receiver , sender:req.loggedUser.id});
  if (!messages) 
    return next(new BadRequestError(`user dont have any chat with this ${req.params.receiver}`));
 
  const s3 = new Bucket();

  await Promise.all(messages.map(async (message) => {
    if (message.media?.url) {
      await s3.removeBucketFiles(message.media.url);
    }
  }));

  await Message.deleteMany({ receiver: req.params.receiver, sender: req.loggedUser.id });
  res.status(204).json({message:'success'});
};