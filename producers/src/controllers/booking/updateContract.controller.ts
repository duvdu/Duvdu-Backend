import 'express-async-errors';

import { NotAllowedError, NotFound, ProducerBooking } from '@duvdu-v1/duvdu';

import { UpdateContractHandler } from '../../types/endpoints';



export const updateContractHandler:UpdateContractHandler = async (req,res,next)=>{

  const contract = await ProducerBooking.findById(req.params.contractId);

  if(!contract)
    return next(new NotFound({en:'contract not found' , ar:'العقد غير موجود'} , req.lang));

  if (contract.producer.toString() != req.loggedUser?.id) 
    return next(new NotAllowedError(undefined , req.lang));

  const updatedContract = await ProducerBooking.findByIdAndUpdate(req.params.contractId , {status:req.body.status} , {new:true}).populate([
    {path:'user' , select:'profileImage username location rate'},
    {path:'producer' , select:'profileImage username location rate'}
  ]);
  
  if (!updatedContract) 
    return next(new NotFound({en:'contract not found' , ar:'العقد غير موجود'} , req.lang));

  res.status(200).json({message:'success' , data:updatedContract});
};