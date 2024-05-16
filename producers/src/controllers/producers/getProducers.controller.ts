import 'express-async-errors';

import { Producer } from '../../models/producers.model';
import { GetProducersHandler } from '../../types/endpoints';


export const getProducersHandler:GetProducersHandler = async (req , res)=>{
  const producers = await Producer.find()
    .populate([{path:'user' , select:'profileImage username location rate'}])
    .limit(req.pagination.limit).skip(req.pagination.skip);
  res.status(200).json({message:'success' , data:producers});
};