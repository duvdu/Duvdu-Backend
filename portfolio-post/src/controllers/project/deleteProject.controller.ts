import 'express-async-errors';

import { NotAllowedError, ProjectCycle } from '@duvdu-v1/duvdu';

import { DeleteProjectHandler } from '../../types/endoints';



export const deleteProjectHandler:DeleteProjectHandler = async (req,res,next)=>{
  const project = await ProjectCycle.findOneAndUpdate({_id:req.params.projectId , user:req.loggedUser.id} , {isDeleted:true} , {new:true});

  if (!project) 
    return next(new NotAllowedError(undefined , req.lang));
  res.status(204).json({message:'success'});
};