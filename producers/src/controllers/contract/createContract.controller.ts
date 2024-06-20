import 'express-async-errors';

import { Bucket, Channels, Contracts, CYCLES, Files, FOLDERS, MODELS, NotFound, Notification, NotificationDetails, NotificationType, Producer } from '@duvdu-v1/duvdu';

import { NewNotificationPublisher } from '../../event/publisher/newNotification.publisher';
import { ProducerContract } from '../../models/producerContracts.model';
import { natsWrapper } from '../../nats-wrapper';
import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { CreateContractHandler } from '../../types/endpoints';
import { contractQueue } from '../../utils/expirationQueue';

export const createContractHandler:CreateContractHandler = async (req,res,next)=>{
  try {
    const attachments = <Express.Multer.File[]>(req.files as any).attachments;
    const producer = await Producer.findById(req.body.producer);
    if (!producer) 
      return next(new NotFound({en:'producer not found' , ar:'لم يتم العثور على المنتج'} , req.lang));
  
    req.body.stageExpiration = await getBestExpirationTime(req.body.appointmentDate.toString());
  
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
      type:NotificationType.new_producer_contract,
      target:contract._id,
      message:NotificationDetails.newProducerContract.title,
      title:NotificationDetails.newProducerContract.message
    });
  
    const populatedNotification = await (
      await notification.save()
    ).populate('sourceUser', 'isOnline profileImage username');

    await new NewNotificationPublisher(natsWrapper.client).publish({
      notificationDetails:{message:notification.message , title:notification.title},
      populatedNotification,
      socketChannel:Channels.new_producer_contract,
      targetUser:notification.targetUser.toString()
    });

    const delay = contract.stageExpiration * 3600 * 1000;
    await contractQueue.add(
      {
        contractId: contract._id.toString(),
      },
      {
        delay,
      },
    );

    await Contracts.create({contract:contract._id , customer:contract.user , sp:producer.user , cycle:CYCLES.producer , ref:MODELS.producerContract});
    
    res.status(201).json({message:'success' , data:contract});
  } catch (error) {
    next(error);
  }
};