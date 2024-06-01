import 'express-async-errors';

import { BadRequestError, NotAllowedError, NotFound, TeamProject, Users } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

import { AddCretiveHandler } from '../../types/endpoints';


export const addCreativeHandler:AddCretiveHandler = async (req,res,next)=>{
  const project = await TeamProject.findById(req.params.projectId);
  if (!project) 
    return next(new NotFound({en:'project not found' , ar:'المشروع غير موجود'} , req.lang));
  if (project.user.toString()!= req.loggedUser?.id) 
    return next(new NotAllowedError(undefined , req.lang));

  const user = await Users.findById(req.body.user);
  if (!user) 
    return next(new BadRequestError({en:`user not found ${req.body.user}` , ar:`المستخدم غير موجود ${req.body.user}`} , req.lang));
  
  const creativeIndex = project.creatives.findIndex((creative: any) => creative._id.toString() === req.body.craetiveScope);
  if (creativeIndex === -1) 
    return next(new NotFound({en:`Category not found: ${req.body.craetiveScope}` , ar:`الفئة غير موجودة: ${req.body.craetiveScope}`} , req.lang));

  project.creatives[creativeIndex].users.push({
    user: new Types.ObjectId(req.body.user),
    workHours:req.body.workHours as number,
    totalAmount:req.body.totalAmount as number,
    status:'pending'
  });

  await project.save();
  res.status(200).json({message:'success'});
  
};