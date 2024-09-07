import 'express-async-errors';

import { Categories, MODELS, ProjectCycle, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose, { PipelineStage, Types } from 'mongoose';

import { GetProjectsHandler } from '../../types/project.endoints';

export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    searchKeywords?: string[];
    location?: { lat: number; lng: number };
    category?: Types.ObjectId[];
    subCategory?: Types.ObjectId[];
    tags?: Types.ObjectId[];
    showOnHome?: boolean;
    startDate?: Date;
    endDate?: Date;
    projectScaleMin?: number;
    projectScaleMax?: number;
    instant?:boolean;
    duration?:number;
  }
> = async (req, res, next) => {
  if (req.query.duration) req.pagination.filter.duration ={$eq: req.query.duration};
  if (req.query.instant != undefined) req.pagination.filter.instant = req.query.instant;
  if (req.query.searchKeywords?.length) {
    req.pagination.filter.$or = req.query.searchKeywords.map((keyword) => ({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
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
    req.pagination.filter.category = { $in: req.query.category };
  }

  if (req.query.subCategory) {
    const subCategoryIds = req.query.subCategory.map(id => new mongoose.Types.ObjectId(id));  
    // Step 1: Retrieve the subcategory titles from the Category model
    const subCategories = await Categories.aggregate([
      { $unwind: '$subCategories' },
      { $match: { 'subCategories._id': { $in: subCategoryIds } } },
      { 
        $project: { 
          _id: 0, 
          'title.ar': '$subCategories.title.ar',
          'title.en': '$subCategories.title.en'
        }
      }
    ]);
  
    // Construct the filter for the subCategory titles in both Arabic and English
    const arabicTitles = subCategories.map(subCat => subCat.title.ar);
    const englishTitles = subCategories.map(subCat => subCat.title.en);
  
    req.pagination.filter['$or'] = [
      { 'subCategory.ar': { $in: arabicTitles } },
      { 'subCategory.en': { $in: englishTitles } }
    ];
    
  
  }


  if (req.query.tags) {
    req.pagination.filter['tags'] = {
      $elemMatch: { _id: { $in: req.query.tags.map(el => new mongoose.Types.ObjectId(el)) } }
    };
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

export const getProjectsHandler: GetProjectsHandler = async (req, res) => {


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
  
  const countResult = await ProjectCycle.aggregate(countPipeline);
  const resultCount = countResult.length > 0 ? countResult[0].totalCount : 0;


  const pipeline: PipelineStage[] = [
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
  
  if (isInstant !== undefined) {    pipeline.push({
    $match: {
      'user.isAvaliableToInstantProjects': isInstant,
    },
  });
  }
  
  pipeline.push(
    {
      $lookup: {
        from: MODELS.category,
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'creatives',
        foreignField: '_id',
        as: 'creatives',
      },
    },
    // Project final fields
    {
      $project: {
        _id: 1,
        user: {
          _id: '$user._id',
          profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$user.profileImage'] },
          isOnline: '$user.isOnline',
          username: '$user.username',
          name: '$user.name',
          rank: '$user.rank',
          projectsView: '$user.projectsView',
          coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$user.coverImage'] },
          acceptedProjectsCounter: '$user.acceptedProjectsCounter',
          rate: '$user.rate',
          profileViews: '$user.profileViews',
          about: '$user.about',
          isAvaliableToInstantProjects: '$user.isAvaliableToInstantProjects',
          pricePerHour: '$user.pricePerHour',
          hasVerificationBadge: '$user.hasVerificationBadge',
          likes: '$user.likes',
          followCount: '$user.followCount',
          address: '$user.address',
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
            in: {
              _id: '$$tag._id',
              title: {
                $cond: {
                  if: { $eq: [req.lang, 'en'] },
                  then: '$$tag.en',
                  else: '$$tag.ar',
                },
              },
            },
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
            input: { $ifNull: ['$creatives', []] },
            as: 'creative',
            in: {
              _id: '$$creative._id',
              profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$$creative.profileImage'] },
              isOnline: '$$creative.isOnline',
              username: '$$creative.username',
              name: '$$creative.name',
              rank: '$$creative.rank',
              projectsView: '$$creative.projectsView',
              coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$$creative.coverImage'] },
              acceptedProjectsCounter: '$$creative.acceptedProjectsCounter',
              rate: '$$creative.rate',
              profileViews: '$$creative.profileViews',
              about: '$$creative.about',
              isAvaliableToInstantProjects: '$$creative.isAvaliableToInstantProjects',
              pricePerHour: '$$creative.pricePerHour',
              hasVerificationBadge: '$$creative.hasVerificationBadge',
              likes: '$$creative.likes',
              followCount: '$$creative.followCount',
              address: '$$creative.address',
            },
          },
        },
        location: 1,
        address: 1,
        searchKeyWords: 1,
        duration: 1,
        showOnHome: 1,
        projectScale: 1,
        rate: 1,
        updatedAt: 1,
        createdAt: 1,
      },
    }
  );
  
  // Execute the aggregation pipeline
  const projects = await ProjectCycle.aggregate(pipeline);
  
  if (req.loggedUser?.id) {
    const user = await Users.findById(req.loggedUser.id, { favourites: 1 });
    projects.forEach((project) => {
      project.isFavourite = user?.favourites.some(
        (el: any) => el.project.toString() === project._id.toString(),
      );
    });
  }

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
