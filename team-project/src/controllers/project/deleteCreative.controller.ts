import 'express-async-errors';

import { BadRequestError, NotAllowedError, NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { DeleteCreativeHandler } from '../../types/endpoints';


export const deleteCreativeHandler:DeleteCreativeHandler = async (req,res,next)=>{
  const project = await TeamProject.findOne({_id:req.params.projectId , isDeleted:{$ne:true}});
  if (!project) 
    return next(new NotFound({en:'project not found' , ar:'المشروع غير موجود'} , req.lang));

  if (project.user.toString()!= req.loggedUser.id) 
    return next(new NotAllowedError(undefined , req.lang));

  const creativeIndex = project.creatives.findIndex((creative: any) => creative._id.toString() === req.body.craetiveScope);
  if (creativeIndex === -1) 
    return next(new NotFound({en:`craetiveScope not found: ${req.body.craetiveScope}` , ar:`النطاق الإبداعي غير موجود: ${req.body.craetiveScope}`} , req.lang));

  const userIndex = project.creatives[creativeIndex].users.findIndex((user: any) => user.user.toString() === req.body.user);
  if (userIndex === -1)
    return next(new BadRequestError({en:'This user was not found in this project',ar:'لم يتم العثور على هذا المستخدم في هذا المشروع'} , req.lang));

  project.creatives[creativeIndex].users.splice(userIndex, 1);

  await project.save();

  res.status(204).json({message:'success'});
};