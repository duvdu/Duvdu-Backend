import 'express-async-errors';

import { Bucket, Files, FOLDERS, NotFound } from '@duvdu-v1/duvdu';

import { Producer, ProducerBooking } from '../../models/producers.model';
import { CreateContractHandler } from '../../types/endpoints';



export const createContarctHandler:CreateContractHandler = async (req , res , next)=>{
  
  const attachments = req.files as Express.Multer.File[];
  console.log(attachments);

  const user = await Producer.findOne({user:req.body.producer});
  if (!user) 
    return next(new NotFound(`this user ${req.body.producer} not producer`));

  const booking = await ProducerBooking.create({
    ...req.body,
    user:'662c9ac0cf033b86395d6e0b'
    // user:req.loggedUser?.id
  });

  await new Bucket().saveBucketFiles(FOLDERS.portfolio_post, ...attachments);

  booking.attachments = attachments.map((el) => `${FOLDERS.portfolio_post}/${el.filename}`);

  await booking.save();
  Files.removeFiles(...booking.attachments);
  res.status(201).json({message:'success' , data:booking});
};