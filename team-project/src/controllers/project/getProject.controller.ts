import 'express-async-errors';

import { NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { GetProjectHandler } from '../../types/endpoints';


export const getProjectHandler:GetProjectHandler = async (req,res,next)=>{
  const project = await TeamProject.findOne({
    _id:req.params.projectId,
    isDeleted : {$ne:true}
  }).populate([
    {path:'user' , select:'isOnline profileImage username name'},
    {path:'creatives.users.user' , select:'isOnline profileImage username name'}
  ]);
    
  if (!project) 
    return next(new NotFound('project not found'));

  res.status(200).json({message:'success' , data:project});
};
