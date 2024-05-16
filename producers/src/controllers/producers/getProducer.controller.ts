import 'express-async-errors';

import { NotFound } from '@duvdu-v1/duvdu';

import { Producer } from '../../models/producers.model';
import { GetProducerHandler } from '../../types/endpoints';





export const getProducerHandler:GetProducerHandler = async (req,res,next)=>{
  const user = await Producer.findById(req.params.producerId)
    .populate([{path:'user' , select:'profileImage username location rate'}]);
  
  if (!user) 
    return next(new NotFound('user not found'));
  res.status(200).json({message:'success' , data:user});
};