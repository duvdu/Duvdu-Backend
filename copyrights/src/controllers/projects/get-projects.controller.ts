import { PaginationResponse, CopyRights, IcopyRights, MODELS, Categories } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose, { PipelineStage } from 'mongoose';

export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    instant?: boolean;
    search?: string;
    user?: string;
    address?: string;
    category?: mongoose.Types.ObjectId[];
    priceFrom?: number;
    priceTo?: number;
    isDeleted?: boolean;
    startDate?: Date;
    endDate?: Date;
    tags?: mongoose.Types.ObjectId[];
    subCategory?: mongoose.Types.ObjectId[];
    duration?: number;
    maxBudget?: number;
    minBudget?: number;
  }
> = async (req, res, next) => {
  if (req.query.maxBudget !== undefined) {
    req.pagination.filter.maxBudget = { $lte: req.query.maxBudget };
  }

  if (req.query.minBudget !== undefined) {
    req.pagination.filter.minBudget = { $gte: req.query.minBudget };
  }
  if (req.query.duration) req.pagination.filter['duration.value'] = { $eq: req.query.duration };
  if (req.query.instant != undefined) req.pagination.filter.instant = req.query.instant;
  if (req.query.search) req.pagination.filter.$text = { $search: req.query.search };
  if (req.query.user) req.pagination.filter.user = req.query.user;
  if (req.query.address)
    req.pagination.filter.address = { $regex: req.query.address, $options: 'i' };
  if (req.query.priceFrom) req.pagination.filter.price = { $gte: req.query.priceFrom };
  if (req.query.priceTo)
    req.pagination.filter.price = {
      ...req.pagination.filter.price,
      $lte: req.query.priceTo,
    };
  if (req.query.category) req.pagination.filter.category = { $in: req.query.category };
  if (req.query.startDate || req.query.endDate)
    req.pagination.filter.createdAt = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  if (req.query.isDeleted !== undefined) {
    req.pagination.filter.isDeleted = req.query.isDeleted ? true : { $ne: true };
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

    // Ensure that at least one of the title arrays has content
    req.pagination.filter['$or'] = [
      { 'subCategory.ar': { $in: arabicTitles } },
      { 'subCategory.en': { $in: englishTitles } },
    ];
  }

  if (req.query.tags) {
    req.pagination.filter['tags._id'] = { $in: req.query.tags };
  }
  next();
};

export const getProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IcopyRights[] }>
> = async (req, res) => {
  let isInstant = undefined;
  if (req.pagination.filter.instant != undefined) isInstant = req.pagination.filter.instant;
  delete req.pagination.filter.instant;

  const countPipeline: PipelineStage[] = [
    {
      $match: {
        ...req.pagination.filter,
        isDeleted: { $ne: true },
      },
    },
  ];

  countPipeline.push({
    $lookup: {
      from: MODELS.user,
      localField: 'user',
      foreignField: '_id',
      as: 'userDetails',
    },
  });

  if (isInstant !== undefined) {
    countPipeline.push({
      $match: {
        'userDetails.isAvaliableToInstantProjects': isInstant,
      },
    });
  }

  countPipeline.push({ $unwind: '$userDetails' });

  countPipeline.push({
    $count: 'totalCount',
  });

  const countResult = await CopyRights.aggregate(countPipeline);
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
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
  ];

  // Conditionally add the $match stage for isInstant
  if (isInstant !== undefined) {
    pipeline.push({
      $match: {
        'userDetails.isAvaliableToInstantProjects': isInstant,
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
      $set: {
        category: {
          _id: '$category._id',
          image: { $concat: [process.env.BUCKET_HOST, '/', '$category.image'] },
          title: {
            $cond: {
              if: { $eq: [req.lang, 'ar'] },
              then: '$category.title.ar',
              else: '$category.title.en',
            },
          },
        },
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: {
              _id: '$$tag._id',
              title: {
                $cond: {
                  if: { $eq: ['ar', req.lang] },
                  then: '$$tag.ar',
                  else: '$$tag.en',
                },
              },
            },
          },
        },
        subCategory: {
          $cond: {
            if: { $eq: ['ar', req.lang] },
            then: '$subCategory.ar',
            else: '$subCategory.en',
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        user: {
          acceptedProjectsCounter: '$userDetails.acceptedProjectsCounter',
          profileImage: { $concat: [process.env.BUCKET_HOST + '/', '$userDetails.profileImage'] },
          name: '$userDetails.name',
          username: '$userDetails.username',
          isOnline: '$userDetails.isOnline',
          rank: '$userDetails.rank',
          projectsView: '$userDetails.projectsView',
          rate: '$userDetails.rate',
        },
        category: {
          _id: 1,
          title: 1,
        },
        price: 1,
        duration: 1,
        address: 1,
        location: 1,
        searchKeywords: 1,
        showOnHome: 1,
        cycle: 1,
        rate: 1,
        tags: 1,
        subCategory: 1,
      },
    },
  );

  // Run the aggregation pipeline
  const projects = await CopyRights.aggregate(pipeline);

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
