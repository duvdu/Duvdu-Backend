import 'express-async-errors';

import { Icategory, NotFound } from '@duvdu-v1/duvdu';

import { TeamProject } from '../../models/teamProject.model';
import { GetProjectHandler } from '../../types/project.endpoints';


export const getProjectHandler:GetProjectHandler = async (req,res,next)=>{

  const project = await TeamProject.findOne({_id:req.params.teamId , isDeleted:{$ne:true}})
    .populate([
      { path: 'user', select: 'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username' },
      { path: 'creatives.category', select: 'title' },
      { path: 'creatives.users.user', select: 'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username' },
    ]);


  if (!project) 
    return next(new NotFound({en:'team not found' , ar:'التيم غير موجود'}));

  const projectObject = project.toObject();

  if (projectObject.user && (projectObject.user as any).profileImage && !((projectObject.user as any).profileImage).startsWith(process.env.BUCKET_HOST)) {
    (projectObject.user as any).profileImage = `${process.env.BUCKET_HOST}/${(projectObject.user as any).profileImage}`;
  }
  if (projectObject.cover) {
    projectObject.cover = `${process.env.BUCKET_HOST}/${projectObject.cover}`;
  }
  projectObject.creatives.forEach(creative => {
    if (creative.category && (creative.category as any).title) {
      (creative.category as Icategory).title = (creative.category as any).title[req.lang];
    }
    creative.users.forEach(user => {
      if (user.user && (user.user as any).profileImage && !((user.user as any).profileImage).startsWith(process.env.BUCKET_HOST)) {
        (user.user as any).profileImage = `${process.env.BUCKET_HOST}/${(user.user as any).profileImage}`;
      }
      user.attachments = user.attachments.map((attachment: string) => `${process.env.BUCKET_HOST}/${attachment}`);
    });
  });


  res.status(200).json({message:'success' , data:projectObject});
};