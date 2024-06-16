import 'express-async-errors';

import { Producer } from '@duvdu-v1/duvdu';

import { DeleteProducerHandler } from '../../types/endpoints';


export const deleteProducerHandler:DeleteProducerHandler = async (req,res)=>{
  await Producer.findByIdAndDelete(req.params.producerId);
  res.status(204).json({message:'success'});
};