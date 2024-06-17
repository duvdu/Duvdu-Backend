import 'express-async-errors';

import { Bucket, Files, FOLDERS, NotFound, Notification, NotificationType, Producer } from '@duvdu-v1/duvdu';

import { ProducerContract } from '../../models/producerContracts.model';
import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { CreateContractHandler } from '../../types/endpoints';



export const createContractHandler:CreateContractHandler = async (req,res,next)=>{
  try {
    const attachments = <Express.Multer.File[]>(req.files as any).attachments;
    const producer = await Producer.findById(req.body.producer);
    if (!producer) 
      return next(new NotFound({en:'producer not found' , ar:'لم يتم العثور على المنتج'} , req.lang));
  
    req.body.stageExpiration = await getBestExpirationTime(req.body.appointmentDate.toString());
    console.log(req.body.stageExpiration);
  
    await new Bucket().saveBucketFiles(FOLDERS.producer, ...attachments, );
    req.body.attachments = attachments.map((el) => `${FOLDERS.producer}/${el.filename}`);
    Files.removeFiles(...req.body.attachments);
    
    const contract = await ProducerContract.create({
      ...req.body ,
      user:req.loggedUser.id
    });
  
    const notification = await Notification.create({
      sourceUser:req.loggedUser.id,
      targetUser:producer.user,
      type:NotificationType.new_message,
      target:contract._id,
      message:NotificationDetails.newMessage.message,
      title:NotificationDetails.newMessage.title
    });
  
    const populatedNotification = await (
      await notification.save()
    ).populate('sourceUser', 'isOnline profileImage username');

    res.status(201).json({message:'success' , data:contract});
  } catch (error) {
    next(error);
  }
};