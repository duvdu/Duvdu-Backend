import 'express-async-errors';


import { TeamProject } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

import { GetProjectsHandler } from '../../types/endpoints';




export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    searchKeywords?: string[];
    location?: { lat: number; lng: number };
    category?: Types.ObjectId; 
    pricePerHourFrom?: number;
    pricePerHourTo?: number;
    showOnHome?: boolean;
    startDate?: Date;
    endDate?: Date;
  }
> = async (req,res,next)=>{

  req.pagination.filter = {};

  if (req.query.searchKeywords) {
    req.pagination.filter.$or = req.query.searchKeywords.map(keyword => ({
      desc: { $regex: keyword, $options: 'i' },
    }));
  }
  if (req.query.location) {
    req.pagination.filter['location.lat'] = req.query.location.lat;
    req.pagination.filter['location.lng'] = req.query.location.lng;
  }
  if (req.query.category) {
    req.pagination.filter.category = req.query.category;
  }
  if (req.query.pricePerHourFrom || req.query.pricePerHourTo) {
    req.pagination.filter['creatives.users.totalAmount'] = {};
    if (req.query.pricePerHourFrom) {
      req.pagination.filter['creatives.users.totalAmount'].$gte = req.query.pricePerHourFrom;
    }
    if (req.query.pricePerHourTo) {
      req.pagination.filter['creatives.users.totalAmount'].$lte = req.query.pricePerHourTo;
    }
  }
  if (req.query.showOnHome !== undefined) {
    req.pagination.filter.showOnHome = req.query.showOnHome;
  }
  if (req.query.startDate || req.query.endDate) {
    req.pagination.filter.startDate = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  }
  next();
};

export const getProjectsHandler:GetProjectsHandler = async(req,res)=>{
  console.log(req.pagination.limit);
  console.log(req.pagination.page);
  

  const projects = await TeamProject.find({ user:req.loggedUser.id , ...req.pagination.filter , isDeleted:{$ne:true}})
    .populate([
      {path:'user' , select:'isOnline profileImage username name rank projectsView'},
      {path:'creatives.users.user' , select:'isOnline profileImage username name rank projectsView'},
      { path: 'creatives.category', select: `title.${req.lang}` }
    ]).sort({createdAt: -1}).skip(req.pagination.skip).limit(req.pagination.limit).lean();

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

  const resultCount = await TeamProject.find({user:req.loggedUser.id,...req.pagination.filter , isDeleted:{$ne:true}}).countDocuments();

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