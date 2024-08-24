/* eslint-disable @typescript-eslint/no-unused-vars */
import 'express-async-errors';

import { Icategory } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

import {  ITeamProject, TeamContract, TeamProject } from '../../models/teamProject.model';
import { GetProjectsHandler } from '../../types/project.endpoints';


export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    searchKeywords?: string[];
    category?: string;
    maxBudget?: number;
    minBudget?: number;
    user?: string;
    creative?:string;
    isDeleted?:boolean;
  }
> = (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.searchKeywords) 
    req.pagination.filter.$or = req.query.searchKeywords.map((keyword: string) => ({
      title: { $regex: keyword, $options: 'i' },
      desc: { $regex: keyword, $options: 'i' }
    }));
  

  if (req.query.category) 
    req.pagination.filter['creatives.category'] = new mongoose.Types.ObjectId(req.query.category);
  

  if (req.query.maxBudget !== undefined) 
    req.pagination.filter['creatives.users.totalAmount'] = { $lte: req.query.maxBudget };
  

  if (req.query.minBudget !== undefined) 
    req.pagination.filter['creatives.users.totalAmount'] = { $gte: req.query.minBudget };

  if (req.query.isDeleted) 
    req.pagination.filter.isDeleted = req.query.isDeleted;
  
  if (req.query.creative) 
    req.pagination.filter['creatives.users.user'] = new mongoose.Types.ObjectId(req.query.creative);

  next();
};



export const getProjectsHandler:GetProjectsHandler = async (req,res)=>{
  const projects = await TeamProject.find({ ...req.pagination.filter , user:req.loggedUser.id, isDeleted: { $ne: true } })
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .populate([
      { path: 'user', select: 'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username' },
      { path: 'creatives.category', select: 'title' },
      { path: 'creatives.users.user', select: 'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username' },
    ]);

  const resultCount = await TeamProject.countDocuments({ ...req.pagination.filter , user:req.loggedUser.id, isDeleted: { $ne: true } });

  const transformedProjects: ITeamProject[] = [];

  for (const project of projects) {
    const projectObject = project.toObject();
  
    // Update URLs with BUCKET_HOST for profileImage, cover, and attachments
    if (projectObject.user && (projectObject.user as any).profileImage && !((projectObject.user as any).profileImage).startsWith(process.env.BUCKET_HOST)) {
      (projectObject.user as any).profileImage = `${process.env.BUCKET_HOST}/${(projectObject.user as any).profileImage}`;
    }
    if (projectObject.cover) {
      projectObject.cover = `${process.env.BUCKET_HOST}/${projectObject.cover}`;
    }
  
    for (const [index, creative] of projectObject.creatives.entries()) {
      if (creative.category && (creative.category as any).title) {
        (creative.category as Icategory).title = (creative.category as any).title[req.lang];
      }
  
      for (const user of creative.users) {
        if (user.user && (user.user as any).profileImage && !((user.user as any).profileImage).startsWith(process.env.BUCKET_HOST)) {
          (user.user as any).profileImage = `${process.env.BUCKET_HOST}/${(user.user as any).profileImage}`;
        }
        user.attachments = user.attachments.map((attachment: string) => `${process.env.BUCKET_HOST}/${attachment}`);
  
        const contract = await TeamContract.findOne({ sp: (user.user as any)._id , customer:projectObject.user , project:projectObject._id });

        if (contract) {
          (user as any).contract = contract._id;
        } else {
          (user as any).contract = null;
        }
      }
    }
  
    transformedProjects.push(projectObject as ITeamProject);
  }

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: transformedProjects,
  });
};

