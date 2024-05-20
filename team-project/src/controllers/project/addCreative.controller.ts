import 'express-async-errors';

import { BadRequestError, NotAllowedError, NotFound, TeamProject, Users } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

import { AddCretiveHandler } from '../../types/endpoints';


export const addCreativeHandler:AddCretiveHandler = async (req,res,next)=>{
  const project = await TeamProject.findById(req.params.projectId);
  if (!project) 
    return next(new NotFound('project not found'));
  if (project.user.toString()!= req.loggedUser?.id) 
    return next(new NotAllowedError('user not owner for this project'));

  const user = await Users.findById(req.body.user);
  if (!user) 
    return next(new BadRequestError(`user not found ${req.body.user}`));
  
  const creativeIndex = project.creatives.findIndex((creative: any) => creative._id.toString() === req.body.craetiveScope);
  if (creativeIndex === -1) 
    return next(new NotFound(`Category not found: ${req.body.craetiveScope}`));

  project.creatives[creativeIndex].users.push({
    user: new Types.ObjectId(req.body.user),
    workHours:req.body.workHours as number,
    totalAmount:req.body.totalAmount as number,
    status:'pending'
  });

  await project.save();
  res.status(200).json({message:'success'});
  
};