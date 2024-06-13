import 'express-async-errors';

import { NotFound, Producer } from '@duvdu-v1/duvdu';

import { GetProducerHandler } from '../../types/endpoints';





export const getProducerHandler:GetProducerHandler = async (req,res,next)=>{
  const user = await Producer.findById(req.params.producerId)
    .populate([{path:'user' , select:'isOnline profileImage username name rate likes about profileViews address followCount acceptedProjectsCounter rank projectsView'}]);
  
  if (!user) 
    return next(new NotFound({en:'user not found' , ar:'المستخدم غير موجود'} , req.lang));
  res.status(200).json({message:'success' , data:user});
};