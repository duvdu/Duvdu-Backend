import 'express-async-errors';

import { BadRequestError, NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { ActionTeamProjectOffer } from '../../types/endpoints';


export const actionTeamProjectHandler:ActionTeamProjectOffer = async (req,res,next)=>{
  const project = await TeamProject.findOne({_id:req.params.projectId , isDeleted:{$ne:true}});
  if (!project) 
    return next(new NotFound({en:'project not found' , ar:'المشروع غير موجود'} , req.lang));

  const creative = project.creatives.filter((creative : any)=> creative._id.toString() === req.body.craetiveScope);
  if (creative.length === 0) 
    return next(new NotFound({en:`craetiveScope not found ${req.body.craetiveScope}` , ar:`النطاق الإبداعي غير موجود ${req.body.craetiveScope}`} , req.lang));
  
  const user = creative[0].users.filter(user => user.user.toString() === req.loggedUser.id);
  if (user.length === 0) 
    return next(new BadRequestError({en:`this user not invited in this team ${req.loggedUser.id}` , ar :`هذا المستخدم لم يتم دعوته لهذا الفريق ${req.loggedUser.id}`} , req.lang));
  
  user[0].status = req.body.status ? 'accepted' : 'rejected';

  await project.save();
  res.status(200).json({message:'success'});
};