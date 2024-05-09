import 'express-validator';
import { BadRequestError, Bucket, Files, FOLDERS, Message, NotFound, UnauthorizedError } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

import { UpdateMessageHandler } from '../../types/endpoints/mesage.endpoints';




export const updateMessageHandler:UpdateMessageHandler = async (req,res,next)=>{
  const message = await Message.findById(req.params.message);
  if (!message)
    return next(new NotFound(`message not found ${req.params.message}`));

  if ([message.sender , message.receiver].includes(new Types.ObjectId(req.loggedUser.id))) 
    return next(new UnauthorizedError(`user not implementied in this chat ${req.loggedUser.id}`));

  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
  if (attachments) {
    (req.body as any).media = {};
    const s3 = new Bucket();
    await s3.saveBucketFiles(FOLDERS.chat , ...attachments);
    if (message.media?.url) 
      await s3.removeBucketFiles(message.media.url);
    (req.body as any).media['url'] = `${FOLDERS.chat}/${attachments[0].filename}`;
    (req.body as any).media['type'] = attachments[0].mimetype;
    Files.removeFiles((req.body as any).media['url']);
  }

  if (req.body.reactions) 
    req.body.reactions[0].user = new Types.ObjectId(req.loggedUser.id);

  const updatedMessage = await Message.findByIdAndUpdate(req.params.message , req.body , {new:true});
  if (!updatedMessage) 
    return next(new BadRequestError(`failed to update this message ${req.params.message}`));
  res.status(200).json({message:'success' , data:updatedMessage});
};