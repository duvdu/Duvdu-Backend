import 'express-async-errors';

import { MODELS, ProjectCycle } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

import { GetProjectsHandler } from '../../types/endoints';

export const getProjectsPagination: RequestHandler<unknown, unknown, unknown, {
  searchKeywords?: string[];
  location?: { lat: number; lng: number };
  category?: Types.ObjectId;
  showOnHome?: boolean;
  startDate?: Date;
  endDate?: Date;
  projectScaleMin?: number;
  projectScaleMax?: number;
}> = async (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.searchKeywords?.length) {
    req.pagination.filter.$or = req.query.searchKeywords.map(keyword => ({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { 'tags.ar': { $regex: keyword, $options: 'i' } }, 
        { 'tags.en': { $regex: keyword, $options: 'i' } }, 
        { 'subCategory.ar': { $regex: keyword, $options: 'i' } }, 
        { 'subCategory.en': { $regex: keyword, $options: 'i' } }, 
        { 'tools.name': { $regex: keyword, $options: 'i' } }, 
        { 'functions.name': { $regex: keyword, $options: 'i' } }, 
        { address: { $regex: keyword, $options: 'i' } }, 
      ],
    }));
  }

  if (req.query.location) {
    req.pagination.filter['location.lat'] = req.query.location.lat;
    req.pagination.filter['location.lng'] = req.query.location.lng;
  }

  if (req.query.category) {
    req.pagination.filter.category = req.query.category;
  }

  if (req.query.showOnHome !== undefined) {
    req.pagination.filter.showOnHome = req.query.showOnHome;
  }

  if (req.query.startDate || req.query.endDate) {
    req.pagination.filter['projectScale'] = {};
    if (req.query.startDate) {
      req.pagination.filter['projectScale.minimum'] = { $gte: req.query.startDate };
    }
    if (req.query.endDate) {
      req.pagination.filter['projectScale.maximum'] = { $lte: req.query.endDate };
    }
  }

  if (req.query.projectScaleMin || req.query.projectScaleMax) {
    req.pagination.filter['projectScale'] = {};
    if (req.query.projectScaleMin) {
      req.pagination.filter['projectScale.minimum'] = { $gte: req.query.projectScaleMin };
    }
    if (req.query.projectScaleMax) {
      req.pagination.filter['projectScale.maximum'] = { $lte: req.query.projectScaleMax };
    }
  }

  next();
};



export const getProjectsHandler:GetProjectsHandler = async (req,res)=>{

  const projects = await ProjectCycle.aggregate([
    {
      $match: { ...req.pagination.filter, isDeleted: false },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: req.pagination.skip,
    },
    {
      $limit: req.pagination.limit,
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: '$category',
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'creatives',
        foreignField: '_id',
        as: 'creatives',
      },
    },
    {
      $unwind: {
        path: '$creatives',
        preserveNullAndEmptyArrays: true, 
      },
    },
    {
      $project: {
        _id: 1,
        user: {
          profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$user.profileImage'] },
          isOnline: '$user.isOnline',
          username: '$user.username',
          name: '$user.name',
          rank: '$user.rank',
          projectsView: '$user.projectsView',
        },
        category: {
          title: '$category.title.' + req.lang,
          _id: '$category._id',
        },
        subCategory: '$subCategory.' + req.lang,
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: '$$tag.' + req.lang,
          },
        },
        cover: { $concat: [process.env.BUCKET_HOST, '/', '$cover'] },
        attachments: {
          $map: {
            input: '$attachments',
            as: 'attachment',
            in: { $concat: [process.env.BUCKET_HOST, '/', '$$attachment'] },
          },
        },
        name: 1,
        description: 1,
        tools: 1,
        functions: 1,
        creatives: {
          $map: {
            input: '$creatives',
            as: 'creative',
            in: {
              profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$$creative.profileImage'] },
              isOnline: '$$creative.isOnline',
              username: '$$creative.username',
              name: '$$creative.name',
              rank: '$$creative.rank',
              projectsView: '$$creative.projectsView',
            },
          },
        },
        location: 1,
        address: 1,
        searchKeyWords: 1,
        insurance: 1,
        showOnHome: 1,
        projectScale: 1,
        rate: 1,
      },
    },
  ]);
  
  const resultCount = await ProjectCycle.countDocuments({...req.pagination.filter , isDeleted:false});

  res.status(200).json({
    message:'success',
    pagination:{
      currentPage:req.pagination.page,
      resultCount,
      totalPages:Math.ceil(resultCount/req.pagination.limit)
    },
    data:projects
  });
};