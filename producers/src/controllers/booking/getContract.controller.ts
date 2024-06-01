import 'express-async-errors';

import { NotFound, ProducerBooking } from '@duvdu-v1/duvdu';

import { GetContractHandler } from '../../types/endpoints';



export const getContractHandler:GetContractHandler = async (req,res,next)=>{
  const contract = await ProducerBooking.findById(req.params.contractId)
    .populate([
      {path:'user' , select:'profileImage username location rate'},
      {path:'producer' , select:'profileImage username location rate'}
    ]);

  if (!contract) 
    return next(new NotFound({en:'contract not found' , ar:'العقد غير موجود'} , req.lang));

  res.status(200).json({message:'success' , data:contract});
};