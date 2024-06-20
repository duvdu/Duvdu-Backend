import 'express-async-errors';

import { BadRequestError, Channels, ContractStatus, NotAllowedError, NotFound, Notification, NotificationDetails, NotificationType, Producer, ProducerContract, UnauthorizedError } from '@duvdu-v1/duvdu';

import { NewNotificationPublisher } from '../../event/publisher/newNotification.publisher';
import { natsWrapper } from '../../nats-wrapper';
import { UpdateContractHandler } from '../../types/endpoints';
import { contractQueue } from '../../utils/expirationQueue';


export const updateContractHandler:UpdateContractHandler = async (req,res,next)=>{
  const contract = await ProducerContract.findById(req.params.contractId);
  if (!contract) 
    return next(new NotFound({en:'contract not found' , ar:'العقد غير موجود'} , req.lang));

  if (contract.user.toString() === req.loggedUser.id && (req.body.status == ContractStatus.accepted || req.body.status == ContractStatus.rejected )&& contract.status != ContractStatus.acceptedWithUpdate) 
    return next(new UnauthorizedError({en:'you can not make this action before producer' , ar:'لا يمكنك القيام بهذا الإجراء قبل منتج'} , req.lang));

  const producer = await Producer.findById(contract.producer);
  if (!producer) 
    return next(new NotFound({en:'producer not found' , ar:'لم يتم العثور على المنتج'} , req.lang));

  if (req.body.appointmentDate) {
    if (producer.user.toString() != req.loggedUser.id) 
      return next(new NotAllowedError(undefined , req.lang));

    if (contract.status == ContractStatus.acceptedWithUpdate) 
      return next(new BadRequestError({en:'you already update appointmentDate before' , ar:'لقد قمت بتحديث الموعد من قبل '} , req.lang));
    
    const givenDate = new Date(req.body.appointmentDate);
    const currentDate = new Date();
    
    const timeDifferenceInHours = Math.abs((givenDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60));

    if (timeDifferenceInHours < contract.stageExpiration + 1) 
      return next(new BadRequestError({en:`appointmentDate must be greater than date for now at least ${contract.stageExpiration + 1} hour` , ar:'يجب أن يكون تاريخ الموعد أكبر من التاريخ الحالي بما لا يقل عن ${contract.stageExpiration * 2} ساعة'} , req.lang));
    
  }


  if (contract.status === ContractStatus.rejected || contract.status === ContractStatus.accepted || contract.status == ContractStatus.canceled) 
    return next(new BadRequestError({en:'sorry contract is closed' , ar:'تم إغلاق العقد'} , req.lang));

  if (req.body.status === ContractStatus.rejected || req.body.status === ContractStatus.canceled)
    if (producer.user.toString() === req.loggedUser.id) 
      req.body.rejectedBy = 'producer';
    else
      req.body.rejectedBy = 'user';

  const updatedContract = await ProducerContract.findByIdAndUpdate(
    req.params.contractId ,
    {...req.body , status:req.body.status?req.body.status:ContractStatus.acceptedWithUpdate , actionAt: new Date()}
    , {new:true}
  );

  const notification = await Notification.create({
    sourceUser:req.loggedUser.id,
    targetUser:producer.user,
    type:NotificationType.updated_producer_contract,
    target:contract._id,
    message:NotificationDetails.updatedProducerContract.title,
    title:NotificationDetails.updatedProducerContract.message
  });

  const populatedNotification = await (
    await notification.save()
  ).populate('sourceUser', 'isOnline profileImage username');

  await new NewNotificationPublisher(natsWrapper.client).publish({
    notificationDetails:{message:notification.message , title:notification.title},
    populatedNotification,
    socketChannel:Channels.updated_producer_contract,
    targetUser:notification.targetUser.toString()
  });

  if (updatedContract?.status == ContractStatus.acceptedWithUpdate) {
    const delay = updatedContract.stageExpiration * 3600 * 1000;
    await contractQueue.add(
      {
        contractId: contract._id.toString(),
      },
      {
        delay,
      },
    );
  }

  res.status(200).json({message:'success' , data:updatedContract!});
};