import 'express-async-errors';

import { BadRequestError, NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { ActionTeamProjectOffer } from '../../types/endpoints';


export const actionTeamProjectHandler:ActionTeamProjectOffer = async (req,res,next)=>{
  const project = await TeamProject.findOne({_id:req.params.projectId , isDeleted:{$ne:true}});
  if (!project) 
    return next(new NotFound('project not found'));

  const creative = project.creatives.filter((creative : any)=> creative._id.toString() === req.body.category);
  if (creative.length === 0) 
    return next(new NotFound(`category not found ${req.body.category}`));
  
  const user = creative[0].users.filter(user => user.user.toString() === req.loggedUser.id);
  if (user.length === 0) 
    return next(new BadRequestError(`this user not invited in this team ${req.loggedUser.id}`));
  
  user[0].status = req.body.status ? 'accepted' : 'rejected';

  await project.save();
  res.status(200).json({message:'success'});
};