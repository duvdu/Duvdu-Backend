import 'express-async-errors';

import { MODELS, Producer } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { GetProducersHandler } from '../../types/endpoints';

export const getProducersPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    searchKeywords?: string[];
    category?: string;
    maxBudget?: number;
    minBudget?: number;
    tags?: string[];
    subCategory?: string;
    user?: string;
  }
> = (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.searchKeywords) {
    req.pagination.filter.$or = req.query.searchKeywords.map((keyword:string) => ({
      searchKeywords: { $regex: keyword, $options: 'i' },
    }));
  }

  if (req.query.category) {
    req.pagination.filter.category = new mongoose.Types.ObjectId( req.query.category);
  }

  if (req.query.maxBudget !== undefined) {
    req.pagination.filter.maxBudget = { $lte: req.query.maxBudget };
  }

  if (req.query.minBudget !== undefined) {
    req.pagination.filter.minBudget = { $gte: req.query.minBudget };
  }

  if (req.query.subCategory) {
    req.pagination.filter['subCategories.title.' + req.lang] = req.query.subCategory;
  }

  if (req.query.tags) {
    req.pagination.filter['subCategories.tags.' + req.lang] = { $in: req.query.tags };
  }

  if (req.query.user) {
    req.pagination.filter.user = new mongoose.Types.ObjectId( req.query.user);
  }

  next();
};


export const getProducersHandler:GetProducersHandler = async (req,res)=>{

  const { filter, skip, limit } = req.pagination; 

  const producers = await Producer.aggregate([
    {
      $match: filter,
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
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
      $unwind: '$user' 
    },
    {
      $project: {
        _id: 1,
        subCategories: {
          $map: {
            input: '$subCategories',
            as: 'subCat',
            in: {
              title: {
                $cond: {
                  if: { $eq: ['ar', req.lang] },
                  then: '$$subCat.title.ar',
                  else: '$$subCat.title.en',
                },
              },
              tags: {
                $map: {
                  input: '$$subCat.tags',
                  as: 'tag',
                  in: {
                    $cond: {
                      if: { $eq: ['ar', req.lang] },
                      then: '$$tag.ar',
                      else: '$$tag.en',
                    },
                  },
                },
              },
              _id: '$$subCat._id',
            },
          },
        },
        minBudget: 1,
        maxBudget: 1,
        searchKeywords: 1,
        createdAt: 1,
        updatedAt: 1,
        category: 1,
        user: {
          profileImage: {
            $cond: [
              { $eq: ['$user.profileImage', null] },
              null,
              { $concat: [process.env.BUCKET_HOST, '$user.profileImage'] },
            ],
          },
          username: '$user.username',
          isOnline: '$user.isOnline',
          acceptedProjectsCounter: '$user.acceptedProjectsCounter',
          name: '$user.name',
          rate: '$user.rate',
          rank: '$user.rank',
          projectsView: '$user.projectsView',
        },
      },
    },
  ]);

  const resultCount = await Producer.countDocuments(filter);
  res.status(200).json({
    message:'success',
    pagination:{
      currentPage:req.pagination.page,
      resultCount,
      totalPages:Math.ceil(resultCount/req.pagination.limit)
    },
    data:producers
  });
};