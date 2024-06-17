import 'express-async-errors';

import { NotFound, Producer } from '@duvdu-v1/duvdu';

import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { CreateContractHandler } from '../../types/endpoints';



export const createContractHandler:CreateContractHandler = async (req,res,next)=>{
  const producer = await Producer.findById(req.body.producer);
  if (!producer) 
    return next(new NotFound({en:'producer not found' , ar:'لم يتم العثور على المنتج'} , req.lang));

  req.body.stageExpiration = await getBestExpirationTime(req.body.appointmentDate.toString());
  console.log(req.body.stageExpiration);
  
    
};