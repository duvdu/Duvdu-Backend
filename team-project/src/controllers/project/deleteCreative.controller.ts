import 'express-async-errors';

import { BadRequestError, NotFound } from '@duvdu-v1/duvdu';

import { TeamProject } from '../../models/teamProject.model';
import { DeleteCreativeHandler } from '../../types/endpoints';


export const deleteCreativeHandler:DeleteCreativeHandler = async (req,res,next)=>{
  const project = await TeamProject.findById(req.params.projectId);
  if (!project) 
    return next(new NotFound('project not found'));

  const creative = project.creatives.filter((creative:any)=> creative._id.toString() === req.body.category);
  if (creative.length === 0) 
    return next(new NotFound(`category not found ${req.body.category}`));
    
  const userIndex = creative[0].users.findIndex(user => user.user.toString() === req.body.user );
  if (userIndex === -1)
    return next(new BadRequestError('this user not found in this project'));

  creative[0].users.slice(userIndex , 1);

  await project.save();

  res.status(204).json({message:'success'});
};