import 'express-async-errors';

import { NotFound } from '@duvdu-v1/duvdu';

import { ProducerBooking } from '../../models/producers.model';
import { GetContractHandler } from '../../types/endpoints';



export const getContractHandler:GetContractHandler = async (req,res,next)=>{
  const contract = await ProducerBooking.findById(req.params.contractId)
    .populate([
      {path:'user' , select:'profileImage username location rate'},
      {path:'producer' , select:'profileImage username location rate'}
    ]);

  if (!contract) 
    return next(new NotFound('contract not found'));

  res.status(200).json({message:'success' , data:contract});
};