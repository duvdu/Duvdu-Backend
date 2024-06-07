import 'express-async-errors';

import { TeamProject } from '@duvdu-v1/duvdu';

import { GetProjectsCrmHandler } from '../../types/endpoints';



export const getProjectsCrmHandler : GetProjectsCrmHandler = async(req,res)=>{

  const projects = await TeamProject.find({ ...req.pagination.filter })
    .populate([
      { path: 'user', select: 'isOnline profileImage username name rank projectsView' },
      { path: 'creatives.users.user', select: 'isOnline profileImage username name rank projectsView' },
      { path: 'creatives.category', select: `title.${req.lang}` }
    ])
    .sort({ createdAt: -1 })
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .lean();

  const addBucketHost = (url: string) => {
    if (url && !url.startsWith(process.env.BUCKET_HOST!)) {
      return `${process.env.BUCKET_HOST}/${url}`;
    }
    return url;
  };
    
  const modifiedProjects = projects.map(project => {
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
    

  
  const resultCount = await TeamProject.find({...req.pagination.filter}).countDocuments();

  res.status(200).json(<any>{
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: modifiedProjects,
  });
};