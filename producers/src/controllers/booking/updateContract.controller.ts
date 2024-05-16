import 'express-async-errors';

import { NotAllowedError, NotFound } from '@duvdu-v1/duvdu';

import { ProducerBooking } from '../../models/producers.model';
import { UpdateContractHandler } from '../../types/endpoints';



export const updateContractHandler:UpdateContractHandler = async (req,res,next)=>{

  const contract = await ProducerBooking.findById(req.params.contractId);

  if(!contract)
    return next(new NotFound('contract not found'));

  if (contract.producer.toString() != req.loggedUser?.id) 
    return next(new NotAllowedError(`this user ${req.loggedUser.id} not producer for this contract ${req.params.contractId}`));

  const updatedContract = await ProducerBooking.findByIdAndUpdate(req.params.contractId , {status:req.body.status} , {new:true}).populate([
    {path:'user' , select:'profileImage username location rate'},
    {path:'producer' , select:'profileImage username location rate'}
  ]);
  
  if (!updatedContract) 
    return next(new NotFound('contract not found'));

  res.status(200).json({message:'success' , data:updatedContract});
};