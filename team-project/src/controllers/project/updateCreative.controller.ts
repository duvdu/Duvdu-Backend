import 'express-async-errors';

import { BadRequestError, NotAllowedError, NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { UpdateCreativeHandler } from '../../types/endpoints';




export const updateCreativeHandler:UpdateCreativeHandler = async (req,res,next)=>{
  const project = await TeamProject.findById(req.params.projectId);
  if (!project) 
    return next(new NotFound('project not found'));
  if (project.user.toString()!= req.loggedUser?.id) 
    return next(new NotAllowedError('user not owner for this project'));

  const creativeIndex = project.creatives.findIndex((creative: any) => creative._id.toString() === req.body.craetiveScope);
  if (creativeIndex === -1) 
    return next(new NotFound(`Category not found: ${req.body.craetiveScope}`));

  const userIndex = project.creatives[creativeIndex].users.findIndex((user: any) => user.user.toString() === req.body.user);
  if (userIndex === -1)
    return next(new BadRequestError('This user was not found in this project'));

  if (req.body.totalAmount) 
    project.creatives[creativeIndex].users[userIndex].totalAmount = req.body.totalAmount;

  if (req.body.workHours) 
    project.creatives[creativeIndex].users[userIndex].workHours = req.body.workHours;
  
  const populatedProject = await (await project.save()).populate([
    {path:'user' , select:'isOnline profileImage username name'},
    {path:'creatives.users.user' , select:'isOnline profileImage username name'}
  ]);

  res.status(200).json({message:'success' , data:populatedProject});
};