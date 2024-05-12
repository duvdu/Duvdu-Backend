import 'express-async-errors';
import { BadRequestError, Bucket, Message } from '@duvdu-v1/duvdu';

import { DeleteChatHandler } from '../../types/endpoints/mesage.endpoints';





export const deleteChatHandler:DeleteChatHandler = async (req,res,next)=>{

  const messages = await Message.find({$or:[
    { sender: req.loggedUser.id, receiver: req.params.receiver },
    { sender: req.params.receiver, receiver: req.loggedUser.id }
  ]});
  if (!messages) 
    return next(new BadRequestError(`user dont have any chat with this ${req.params.receiver}`));
 
  const s3 = new Bucket();

  await Promise.all(messages.map(async (message) => {
    if (message.media && message.media.length > 0) {
      for (const attach of message.media) {
        await s3.removeBucketFiles(attach.url);
      }
    }
  }));

  await Message.deleteMany({ receiver: req.params.receiver, sender: req.loggedUser.id });
  res.status(204).json({message:'success'});
};