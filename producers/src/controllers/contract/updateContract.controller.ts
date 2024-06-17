import 'express-async-errors';

import { BadRequestError, NotAllowedError, NotFound, Producer } from '@duvdu-v1/duvdu';

import { ContractStatus, ProducerContract } from '../../models/producerContracts.model';
import { UpdateContractHandler } from '../../types/endpoints';


export const updateContractHandler:UpdateContractHandler = async (req,res,next)=>{
  const contract = await ProducerContract.findById(req.params.contractId);
  if (!contract) 
    return next(new NotFound({en:'contract not found' , ar:'العقد غير موجود'} , req.lang));

  const producer = await Producer.findById(contract.producer);
  if (!producer) 
    return next(new NotFound({en:'producer not found' , ar:'لم يتم العثور على المنتج'} , req.lang));

  if (req.body.appointmentDate) {
    if (producer.user.toString() != req.loggedUser.id) 
      return next(new NotAllowedError(undefined , req.lang));

    const givenDate = new Date(req.body.appointmentDate);
    const currentDate = new Date();
    
    const timeDifferenceInHours = Math.abs((givenDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60));

    if (timeDifferenceInHours < contract.stageExpiration) 
      return next(new BadRequestError({en:`appointmentDate must be greater than date for now at least ${contract.stageExpiration * 2} hour` , ar:'يجب أن يكون تاريخ الموعد أكبر من التاريخ الحالي بما لا يقل عن ${contract.stageExpiration * 2} ساعة'} , req.lang));
  }

  if (contract.status === ContractStatus.rejected || contract.status === ContractStatus.accepted || contract.status == ContractStatus.canceled) 
    return next(new BadRequestError({en:'sorry contract is closed' , ar:'تم إغلاق العقد'} , req.lang));

  if (req.body.status === ContractStatus.rejected || req.body.status === ContractStatus.canceled)
    if (producer.user.toString() === req.loggedUser.id) 
      req.body.rejectedBy = 'producer';
    else
      req.body.rejectedBy = 'user';

  const updatedContract = await ProducerContract.findByIdAndUpdate(req.params.contractId , {...req.body , status:ContractStatus.acceptedWithUpdate} , {new:true});

  res.status(200).json({message:'success' , data:updatedContract!});
};