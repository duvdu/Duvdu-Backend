import 'express-async-errors';

import { NotFound, Producer } from '@duvdu-v1/duvdu';

import { DeleteLoggedProducerHandler } from '../../types/endpoints';



export const deleteLoggedProducerHandler:DeleteLoggedProducerHandler = async (req,res , next)=>{
  const producer = await Producer.findOneAndDelete({user:req.loggedUser.id});
  if (!producer)
    return next(new NotFound({en:'producer not found' , ar:'لم يتم العثور على المنتج'} , req.lang));

  res.status(204).json({message:'success'});
};