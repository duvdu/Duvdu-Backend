import 'express-async-errors';

import { NotFound, Producer, Users } from '@duvdu-v1/duvdu';

import { AppendProducerHandler } from '../../types/endpoints';



export const appendProducerHandler:AppendProducerHandler = async (req,res,next)=>{
  const user = await Users.findById(req.loggedUser.id);
  if (!user) 
    return next(new NotFound('user not found'));
  await Producer.create({user:req.loggedUser.id});
  res.status(201).json({message:'success'});
};