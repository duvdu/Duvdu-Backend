import 'express-async-errors';

import { Bucket, Files, FOLDERS, NotAllowedError, NotFound, Producer, ProducerBooking } from '@duvdu-v1/duvdu';

import { CreateContractHandler } from '../../types/endpoints';



export const createContarctHandler:CreateContractHandler = async (req , res , next)=>{
  
  const attachments = req.files as Express.Multer.File[];

  const user = await Producer.findOne({user:req.body.producer});
  if (!user) 
    return next(new NotFound({en:`this user ${req.body.producer} not producer` , ar:`هذا المستخدم ${req.body.producer} ليس منتجًا`} , req.lang));
  console.log(req.body.producer?.toString() == req.loggedUser.id);
  
  if (req.body.producer?.toString() == req.loggedUser.id) 
    return next(new NotAllowedError(undefined , req.lang));

  const booking = await ProducerBooking.create({
    ...req.body,
    user:req.loggedUser?.id
  });

  await new Bucket().saveBucketFiles(FOLDERS.portfolio_post, ...attachments);

  booking.attachments = attachments.map((el) => `${FOLDERS.portfolio_post}/${el.filename}`);

  await booking.save();
  Files.removeFiles(...booking.attachments);
  res.status(201).json({message:'success' , data:booking});
};