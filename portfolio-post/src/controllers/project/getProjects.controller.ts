import 'express-async-errors';

import { Categories, MODELS, ProjectCycle } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose, { PipelineStage, Types } from 'mongoose';

import { GetProjectsHandler } from '../../types/project.endoints';

export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    location?: { lat: number; lng: number };
    category?: Types.ObjectId[];
    subCategory?: Types.ObjectId[];
    tags?: Types.ObjectId[];
    showOnHome?: boolean;
    startDate?: Date;
    endDate?: Date;
    projectScaleMin?: number;
    projectScaleMax?: number;
    instant?: boolean;
    duration?: number;
  }
> = async (req, res, next) => {
  if (req.query.duration) req.pagination.filter.duration = { $eq: req.query.duration };
  if (req.query.instant != undefined) req.pagination.filter.instant = req.query.instant;
  if (req.query.search) {
    req.pagination.filter = {
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { 'tools.name': { $regex: req.query.search, $options: 'i' } },
        { 'functions.name': { $regex: req.query.search, $options: 'i' } },
        { address: { $regex: req.query.search, $options: 'i' } },
      ],
    };
  }

  if (req.query.location) {
    req.pagination.filter['location.lat'] = req.query.location.lat;
    req.pagination.filter['location.lng'] = req.query.location.lng;
  }

  if (req.query.category) {
    req.pagination.filter.category = { $in: req.query.category };
  }

  if (req.query.subCategory) {
    const subCategoryIds = req.query.subCategory.map((id) => new mongoose.Types.ObjectId(id));
    // Step 1: Retrieve the subcategory titles from the Category model
    const subCategories = await Categories.aggregate([
      { $unwind: '$subCategories' },
      { $match: { 'subCategories._id': { $in: subCategoryIds } } },
      {
        $project: {
          _id: 0,
          'title.ar': '$subCategories.title.ar',
          'title.en': '$subCategories.title.en',
        },
      },
    ]);

    // Construct the filter for the subCategory titles in both Arabic and English
    const arabicTitles = subCategories.map((subCat) => subCat.title.ar);
    const englishTitles = subCategories.map((subCat) => subCat.title.en);

    req.pagination.filter['$or'] = [
      { 'subCategory.ar': { $in: arabicTitles } },
      { 'subCategory.en': { $in: englishTitles } },
    ];
  }

  if (req.query.tags) {
    req.pagination.filter['tags'] = {
      $elemMatch: { _id: { $in: req.query.tags.map((el) => new mongoose.Types.ObjectId(el)) } },
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
  if (req.pagination.filter.instant != undefined) isInstant = req.pagination.filter.instant;
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
    ...(isInstant !== undefined
      ? [
        {
          $match: {
            'user.isAvaliableToInstantProjects': isInstant,
          },
        },
      ]
      : []),
    {
      $count: 'totalCount',
    },
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

  if (isInstant !== undefined) {
    pipeline.push({
      $match: {
        'user.isAvaliableToInstantProjects': isInstant,
      },
    });
  }

  pipeline.push(
    // Existing category lookup and unwind stages
    {
      $lookup: {
        from: MODELS.category,
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    
    // Unwind creatives array to handle each creative individually
    { $unwind: { path: '$creatives', preserveNullAndEmptyArrays: true } },
    
    // Populate the creative field within each creative object in the array
    {
      $lookup: {
        from: MODELS.user,
        localField: 'creatives.creative',
        foreignField: '_id',
        as: 'creativeDetails',
      },
    },
    { $unwind: { path: '$creativeDetails', preserveNullAndEmptyArrays: true } },
  
    // Reassemble the creatives array
    {
      $group: {
        _id: '$_id',
        creatives: {
          $push: {
            _id: '$creativeDetails._id',
            profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$creativeDetails.profileImage'] },
            isOnline: '$creativeDetails.isOnline',
            username: '$creativeDetails.username',
            name: '$creativeDetails.name',
            rank: '$creativeDetails.rank',
            projectsView: '$creativeDetails.projectsView',
            coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$creativeDetails.coverImage'] },
            acceptedProjectsCounter: '$creativeDetails.acceptedProjectsCounter',
            rate: '$creativeDetails.rate',
            profileViews: '$creativeDetails.profileViews',
            about: '$creativeDetails.about',
            isAvaliableToInstantProjects: '$creativeDetails.isAvaliableToInstantProjects',
            pricePerHour: '$creativeDetails.pricePerHour',
            hasVerificationBadge: '$creativeDetails.hasVerificationBadge',
            likes: '$creativeDetails.likes',
            followCount: '$creativeDetails.followCount',
            address: '$creativeDetails.address',
            inviteStatus: '$creatives.inviteStatus', // Include original inviteStatus field
          },
        },
        // Retain other fields
        doc: { $first: '$$ROOT' },
      },
    },
    
    // Restore root document structure
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: ['$doc', { creatives: '$creatives' }] },
      },
    },
  
    // Continue with the favourite lookup and project stages
    {
      $lookup: {
        from: 'favourites',
        localField: '_id',
        foreignField: 'project',
        as: 'favourite',
      },
    },
    {
      $addFields: {
        favouriteCount: { $size: '$favourite' },
      },
    },
    {
      $unwind: { path: '$favourite', preserveNullAndEmptyArrays: true },
    },
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
        creatives: 1, // Include the populated creatives array
        location: 1,
        address: 1,
        searchKeyWords: 1,
        duration: 1,
        showOnHome: 1,
        projectScale: 1,
        rate: 1,
        updatedAt: 1,
        createdAt: 1,
        isFavourite: {
          $cond: {
            if: {
              $eq: [
                '$favourite.user',
                req.loggedUser?.id ? new mongoose.Types.ObjectId(req.loggedUser.id) : '0',
              ],
            },
            then: true,
            else: false,
          },
        },
        favouriteCount: 1,
      },
    }
  );

 
  // Execute the aggregation pipeline
  const projects = await ProjectCycle.aggregate(pipeline);

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
