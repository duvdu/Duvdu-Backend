import 'express-async-errors';

import { MODELS, NotFound, ProjectCycle } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { GetProjectHandler } from '../../types/endoints';


export const getProjectHandler:GetProjectHandler = async (req,res,next)=>{
  const projects = await ProjectCycle.aggregate([
    {
      $match: { _id:new mongoose.Types.ObjectId(req.params.projectId) , isDeleted:false},
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
          title:'$category.title.' + req.lang,
          _id: '$category._id'
        }, 
        subCategory: '$subCategory.' + req.lang, 
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: '$$tag.' + req.lang
          }
        },
        cover: { $concat: [process.env.BUCKET_HOST, '/', '$cover'] }, 
        attachments: { $map: { input: '$attachments', as: 'attachment', in: { $concat: [process.env.BUCKET_HOST, '/', '$$attachment'] } } }, 
        name: 1,
        description: 1,
        tools: 1,
        functions: 1,
        creatives: 1,
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

  if (!projects[0]) 
    return next(new NotFound({en:'project not found' , ar:'المشروع غير موجود'} , req.lang));

  res.status(200).json({message:'success' , data:projects[0]});
};