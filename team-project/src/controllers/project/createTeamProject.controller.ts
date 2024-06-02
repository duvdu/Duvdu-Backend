import 'express-async-errors';
import { BadRequestError, Bucket, Categories, Files, FOLDERS, MODELS, Project, TeamProject, Users } from '@duvdu-v1/duvdu';

import { CreateProjectHandler } from '../../types/endpoints';


export const createProjectHandler:CreateProjectHandler = async (req,res,next)=>{  
  const attachments = <Express.Multer.File[]>(req.files as any).attachments;
  const cover = <Express.Multer.File[]>(req.files as any).cover;

  const categories = req.body.creatives.flatMap((creative:any) => creative.category);
  const categoryFound = await Categories.find({_id:{$in:categories}}).countDocuments();

  if (categoryFound != categories.length) 
    return next(new BadRequestError({en:'invalid categories' , ar:'الفئات غير صالحة'} , req.lang));

  let users = req.body.creatives.flatMap((creative:any) => creative.users?.map((user:any) => user.user));
  users  = users[0]== undefined?[]:users;
  
  const creativeFound = await Users.find({_id:{$in:users}}).countDocuments();
  
  if (creativeFound != users.length) 
    return next(new BadRequestError({en:'invalid creatives' , ar:'الإبداعات غير صالحة'} , req.lang));

  const project = await TeamProject.create({
    ...req.body,
    user:req.loggedUser?.id
  });
  
  await new Bucket().saveBucketFiles(FOLDERS.team_project, ...attachments, ...cover);
  project.cover = `${FOLDERS.team_project}/${cover[0].filename}`;
  project.attachments = attachments.map((el) => `${FOLDERS.team_project}/${el.filename}`);
  await project.save();
  Files.removeFiles(...project.attachments, project.cover);

  await Project.create({project:{
    type:project.id,
    ref:MODELS.studioBooking
  } , ref:MODELS.studioBooking, user: req.loggedUser.id});

  res.status(201).json({message:'success' , data:project});
};