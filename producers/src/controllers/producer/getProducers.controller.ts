import 'express-async-errors';

import { MODELS, Producer } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose, { PipelineStage, Types } from 'mongoose';

import { GetProducersHandler } from '../../types/endpoints';

export const getProducersPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search: string;
    category?: string;
    maxBudget?: number;
    minBudget?: number;
    tags?: Types.ObjectId[];
    subCategory?: Types.ObjectId[];
    user?: string;
    instant?:boolean;
  }
> = (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.instant != undefined) req.pagination.filter.instant = req.query.instant;
  if (req.query.search) {
    req.pagination.filter.$or =  { $regex: req.query.search, $options: 'i' };
  }

  if (req.query.category) {
    req.pagination.filter.category = new mongoose.Types.ObjectId(req.query.category);
  }

  if (req.query.maxBudget !== undefined) {
    req.pagination.filter.maxBudget = { $lte: req.query.maxBudget };
  }

  if (req.query.minBudget !== undefined) {
    req.pagination.filter.minBudget = { $gte: req.query.minBudget };
  }

  if (req.query.subCategory) {
    console.log(req.query.subCategory);
    
    req.pagination.filter['subCategories'] = {
      $elemMatch: {
        _id: { $in: req.query.subCategory.map(el => new mongoose.Types.ObjectId(el)) }
      }
    };
  }

  if (req.query.tags) {
    req.pagination.filter['subCategories'] = {
      $elemMatch: {
        tags: { $elemMatch: { _id: { $in: req.query.tags.map(el => new mongoose.Types.ObjectId(el)) } } }
      }
    };  }

  if (req.query.user) {
    req.pagination.filter.user = new mongoose.Types.ObjectId(req.query.user);
  }

  next();
};

export const getProducersHandler: GetProducersHandler = async (req, res, next) => {
  try {

    let isInstant = undefined;
    if (req.pagination.filter.instant != undefined) 
      isInstant = req.pagination.filter.instant;
    delete req.pagination.filter.instant;
    
    
  
    const countPipeline = [
      {
        $match: {
          ...req.pagination.filter,
          isDeleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from: MODELS.user,
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      ...(isInstant !== undefined ? [{
        $match: {
          'user.isAvaliableToInstantProjects': isInstant,
        },
      }] : []),
      {
        $count: 'totalCount'
      }
    ];
    
    // Execute count aggregation
    const countResult = await Producer.aggregate(countPipeline);
    const resultCount = countResult.length > 0 ? countResult[0].totalCount : 0;

    const pipeline : PipelineStage[] = [
      {
        $match: {
          ...req.pagination.filter,
          isDeleted: { $ne: true },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: req.pagination.skip },
      { $limit: req.pagination.limit },
      {
        $lookup: {
          from: MODELS.user,
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];

    if (isInstant !== undefined) {
      pipeline.push({
        $match: {
          'user.isAvaliableToInstantProjects': isInstant,
        },
      });
    }

    pipeline.push( {
      $lookup: {
        from: MODELS.category,
        localField: 'category',
        foreignField: '_id',
        as: 'categoryData',
      },
    },
    {
      $unwind: '$categoryData',
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
                    title: {
                      $cond: {
                        if: { $eq: ['ar', req.lang] },
                        then: '$$tag.ar',
                        else: '$$tag.en',
                      },
                    },
                    _id: '$$tag._id',
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
        category: {
          _id: '$categoryData._id',
          image: {
            $concat: [process.env.BUCKET_HOST, '/', '$categoryData.image'],
          },
          title: {
            $cond: {
              if: { $eq: ['ar', req.lang] },
              then: '$categoryData.title.ar',
              else: '$categoryData.title.en',
            },
          },
        },
        user: {
          profileImage: {
            $cond: [
              { $eq: ['$user.profileImage', null] },
              null,
              { $concat: [process.env.BUCKET_HOST, '/', '$user.profileImage'] },
            ],
          },
          username: '$user.username',
          isOnline: '$user.isOnline',
          acceptedProjectsCounter: '$user.acceptedProjectsCounter',
          name: '$user.name',
          rate: '$user.rate',
          rank: '$user.rank',
          projectsView: '$user.projectsView',
          _id: '$user._id',
        },
      },
    }
    );
    const producers = await Producer.aggregate(pipeline);

    res.status(200).json({
      message: 'success',
      pagination: {
        currentPage: req.pagination.page,
        resultCount,
        totalPages: Math.ceil(resultCount / req.pagination.limit),
      },
      data: producers,
    });
  } catch (error) {
    next(error);
  }
};
