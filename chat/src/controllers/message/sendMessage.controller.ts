import 'express-async-errors';
import { Bucket, Files, FOLDERS, Message, NotFound, Users } from '@duvdu-v1/duvdu';

import { SendMessageHandler } from '../../types/endpoints/mesage.endpoints';





export const sendMessageHandler:SendMessageHandler = async (req,res,next)=>{

  const receiver = await Users.findById(req.body.receiver);
  if (!receiver) 
    return next(new NotFound(`no receiver in this id ${req.body.receiver}`));

  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;  
  if (attachments) {
    (req.body as any).media = {};
    const s3 = new Bucket();
    await s3.saveBucketFiles(FOLDERS.chat, ...attachments);
    (req.body as any).media['url'] = `${FOLDERS.chat}/${attachments[0].filename}`;
    (req.body as any).media['type'] = attachments[0].mimetype;
    Files.removeFiles((req.body as any).media['url']);
  }

  const message = await Message.create({
    ...req.body,
    sender:req.loggedUser.id
  });

  const populatedMessage = await message
    .populate([
      {path:'sender' , select:'profileImage isOnline username name'},
      {path:'receiver' , select:'profileImage isOnline username name'},
      { path: 'reactions.user', select: 'profileImage isOnline username name' }
    ]);
  res.status(201).json({message:'success' , data:populatedMessage});
};