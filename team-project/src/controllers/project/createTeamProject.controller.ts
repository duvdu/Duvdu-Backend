import 'express-async-errors';
import { BadRequestError, Bucket, Files, FOLDERS, MODELS, Project, TeamProject, Users } from '@duvdu-v1/duvdu';

import { CreateProjectHandler } from '../../types/endpoints';


export const createProjectHandler:CreateProjectHandler = async (req,res,next)=>{  
  const attachments = <Express.Multer.File[]>(req.files as any).attachments;
  const cover = <Express.Multer.File[]>(req.files as any).cover;

  const users = req.body.creatives.flatMap((creative:any) => creative.users.map((user:any) => user.user));
  
  const creativeFound = await Users.find({_id:{$in:users}}).countDocuments();
  
  if (creativeFound != users.length) 
    return next(new BadRequestError('invalid creatives'));

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
  } , ref:MODELS.studioBooking});

  res.status(201).json({message:'success' , data:project});
};