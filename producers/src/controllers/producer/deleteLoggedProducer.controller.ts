import 'express-async-errors';

import { Producer } from '@duvdu-v1/duvdu';

import { DeleteLoggedProducerHandler } from '../../types/endpoints';



export const deleteLoggedProducerHandler:DeleteLoggedProducerHandler = async (req,res)=>{
  await Producer.findOneAndDelete({user:req.loggedUser.id});
  res.status(204).json({message:'success'});
};