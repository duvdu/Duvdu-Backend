import 'express-async-errors';

import { NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { GetProjectHandler } from '../../types/endpoints';


export const getProjectHandler:GetProjectHandler = async (req,res,next)=>{
  const project = await TeamProject.findOne({
    _id:req.params.projectId,
    user:req.loggedUser.id,
    isDeleted : {$ne:true}
  }).populate([
    {path:'user' , select:'isOnline profileImage username name rank projectsView'},
    {path:'creatives.users.user' , select:'isOnline profileImage username name rank projectsView'},
    { path: 'creatives.category', select: `title.${req.lang}` }
  ]).lean();

  if (!project) 
    return next(new NotFound({en:'project not found' , ar:'المشروع غير موجود'} , req.lang));
  
  
  const addBucketHost = (url: string) => {
    if (url && !url.startsWith(process.env.BUCKET_HOST!)) {
      return `${process.env.BUCKET_HOST}/${url}`;
    }
    return url;
  };
        
  const modifiedProjects = [project].map(project => {
    const modifiedProject = { ...project };
      
    modifiedProject.cover = addBucketHost(modifiedProject.cover);
      
    if (modifiedProject.attachments) {
      modifiedProject.attachments = modifiedProject.attachments.map(addBucketHost);
    }
      
    (modifiedProject as any).numUsers = modifiedProject.creatives?.reduce((acc, creative) => {
      return acc + (creative.users ? creative.users.length : 0);
    }, 0);
      
    modifiedProject.creatives?.forEach(creative => {
      creative.users?.forEach(user => {
        if (user.user && (user.user as any).profileImage) {
          (user.user as any).profileImage = addBucketHost((user.user as any).profileImage);
        }
      });
      
      if (creative.category && (creative.category as any).title && (creative.category as any).title[req.lang]) {
        (creative.category as any).title = (creative.category as any).title[req.lang];
      }
    });
      
    if (modifiedProject.user && (modifiedProject.user as any).profileImage) {
      (modifiedProject.user as any).profileImage = addBucketHost((modifiedProject.user as any).profileImage);
    }
      
    return modifiedProject;
  });
    


  res.status(200).json(<any>{message:'success' , data:modifiedProjects[0]});
};
