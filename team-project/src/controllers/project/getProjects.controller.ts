import 'express-async-errors';


import { RequestHandler } from 'express';
import { Types } from 'mongoose';

import { TeamProject } from '../../models/teamProject.model';
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
    user?: Types.ObjectId; 
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
  if (req.query.user) {
    req.pagination.filter['creatives.users.user'] = req.query.user;
  }

  next();
};

export const getProjectsHandler:GetProjectsHandler = async(req,res)=>{

  const projects = await TeamProject.find({...req.pagination.filter , isDeleted:{$ne:true}})
    .populate([
      {path:'user' , select:'isOnline profileImage username'},
      {path:'creatives.users.user' , select:'isOnline profileImage username'}
    ]).sort({createdAt: -1}).limit(req.pagination.limit).skip(req.pagination.skip);

  const resultCount = await TeamProject.find({...req.pagination.filter , isDeleted:{$ne:true}}).countDocuments();

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: projects,
  });
};