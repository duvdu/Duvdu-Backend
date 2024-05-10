import 'express-async-errors';

import { BadRequestError, Message } from '@duvdu-v1/duvdu';

import { MarkMessageAsWatchedHandler } from '../../types/endpoints/mesage.endpoints';




export const markMessageAsWatchedHandler:MarkMessageAsWatchedHandler = async (req,res , next)=>{

  const messageCount = await Message.countDocuments({
    _id: req.body.messages.map((el: any) => el),
  });

  if (messageCount != req.body.messages.length) 
    return next(new BadRequestError('invalid messages'));


  await Message.updateMany(
    { _id: { $in: req.body.messages },  sender: req.params.receiver ,  receiver: req.loggedUser.id }, 
    { $set: { watched: true } },
    {new:true}
  );


  res.status(200).json({message:'success'});
};