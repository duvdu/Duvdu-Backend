import 'express-async-errors';

import { BadRequestError, NotAllowedError, NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { DeleteCreativeHandler } from '../../types/endpoints';


export const deleteCreativeHandler:DeleteCreativeHandler = async (req,res,next)=>{
  const project = await TeamProject.findOne({_id:req.params.projectId , isDeleted:{$ne:true}});
  if (!project) 
    return next(new NotFound('project not found'));

  if (project.user.toString()!= req.loggedUser.id) 
    return next(new NotAllowedError('user not owner for this project'));

  const creativeIndex = project.creatives.findIndex((creative: any) => creative._id.toString() === req.body.craetiveScope);
  if (creativeIndex === -1) 
    return next(new NotFound(`craetiveScope not found: ${req.body.craetiveScope}`));

  const userIndex = project.creatives[creativeIndex].users.findIndex((user: any) => user.user.toString() === req.body.user);
  if (userIndex === -1)
    return next(new BadRequestError('This user was not found in this project'));

  project.creatives[creativeIndex].users.splice(userIndex, 1);

  await project.save();

  res.status(204).json({message:'success'});
};