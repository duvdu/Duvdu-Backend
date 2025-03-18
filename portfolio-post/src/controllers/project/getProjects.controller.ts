import 'express-async-errors';

import {
  Categories,
  InviteStatus,
  MODELS,
  ProjectContractStatus,
  ProjectCycle,
} from '@duvdu-v1/duvdu';
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
    maxBudget?: number;
    minBudget?: number;
    maxDistance?: number;
    relatedCategory?: Types.ObjectId[];
    relatedSubCategory?: Types.ObjectId[];
    relatedTags?: Types.ObjectId[];
  }
> = async (req, res, next) => {
  req.query.maxDistance = +(req.query.maxDistance || 1000);
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

  if (req.query.maxBudget !== undefined) {
    req.pagination.filter.maxBudget = { $lte: req.query.maxBudget };
  }

  if (req.query.minBudget !== undefined) {
    req.pagination.filter.minBudget = { $gte: req.query.minBudget };
  }

  if (req.query.relatedCategory && req.query.relatedCategory.length > 0) {
    if (!req.pagination.filter.$and) {
      req.pagination.filter.$and = [];
    }

    const categoryIds = req.query.relatedCategory.map((id) => new mongoose.Types.ObjectId(id));
    req.pagination.filter.$and.push({
      relatedCategory: {
        $elemMatch: {
          category: { $in: categoryIds },
        },
      },
    });

    if (req.query.relatedSubCategory && req.query.relatedSubCategory.length > 0) {
      const subCategoryIds = req.query.relatedSubCategory.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
      req.pagination.filter.$and.push({
        relatedCategory: {
          $elemMatch: {
            subCategories: {
              $elemMatch: {
                subCategory: { $in: subCategoryIds },
              },
            },
          },
        },
      });
    }

    if (req.query.relatedTags && req.query.relatedTags.length > 0) {
      const tagIds = req.query.relatedTags.map((id) => new mongoose.Types.ObjectId(id));
      req.pagination.filter.$and.push({
        relatedCategory: {
          $elemMatch: {
            subCategories: {
              $elemMatch: {
                tags: {
                  $elemMatch: {
                    tag: { $in: tagIds },
                  },
                },
              },
            },
          },
        },
      });
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
        showOnHome: { $ne: false },
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

  const pipelines: PipelineStage[] = [];

  pipelines.push(
    {
      $match: {
        ...req.pagination.filter,
        isDeleted: { $ne: true },
        showOnHome: { $ne: false },
      },
    },
    // { $sort: { createdAt: -1 } },
    // { $skip: req.pagination.skip },
    // { $limit: req.pagination.limit },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
  );

  if (isInstant !== undefined) {
    pipelines.push({
      $match: {
        'user.isAvaliableToInstantProjects': isInstant,
      },
    });
  }

  pipelines.push(
    {
      $lookup: {
        from: MODELS.category,
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },

    { $unwind: { path: '$creatives', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: MODELS.user,
        localField: 'creatives.creative',
        foreignField: '_id',
        as: 'creativeDetails',
      },
    },
    { $unwind: { path: '$creativeDetails', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: MODELS.category,
        localField: 'creatives.mainCategory.category',
        foreignField: '_id',
        as: 'mainCategoryDetails',
      },
    },
    { $unwind: { path: '$mainCategoryDetails', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: MODELS.category,
        localField: 'creatives.mainCategory.relatedCategory.category',
        foreignField: '_id',
        as: 'relatedCategoryDetails',
      },
    },
    { $unwind: { path: '$relatedCategoryDetails', preserveNullAndEmptyArrays: true } },

    {
      $group: {
        _id: '$_id',
        creatives: {
          $push: {
            $cond: [
              {
                $and: [
                  { $eq: ['$creatives.inviteStatus', InviteStatus.accepted] },
                  { $ne: ['$creativeDetails', null] },
                  { $ne: [{ $type: '$creativeDetails' }, 'missing'] },
                ],
              },
              {
                _id: '$creativeDetails._id',
                profileImage: {
                  $concat: [process.env.BUCKET_HOST, '/', '$creativeDetails.profileImage'],
                },
                isOnline: '$creativeDetails.isOnline',
                username: '$creativeDetails.username',
                name: '$creativeDetails.name',
                rank: '$creativeDetails.rank',
                projectsView: '$creativeDetails.projectsView',
                coverImage: {
                  $concat: [process.env.BUCKET_HOST, '/', '$creativeDetails.coverImage'],
                },
                acceptedProjectsCounter: '$creativeDetails.acceptedProjectsCounter',
                rate: '$creativeDetails.rate',
                profileViews: '$creativeDetails.profileViews',
                about: '$creativeDetails.about',
                isAvaliableToInstantProjects: '$creativeDetails.isAvaliableToInstantProjects',
                pricePerHour: '$creativeDetails.pricePerHour',
                hasVerificationBadge: '$creativeDetails.hasVerificationBadge',
                haveInvitation: '$creativeDetails.haveInvitation',
                likes: '$creativeDetails.likes',
                followCount: '$creativeDetails.followCount',
                address: '$creativeDetails.address',
                inviteStatus: '$creatives.inviteStatus',
                mainCategory: {
                  category: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ['$mainCategoryDetails', null] },
                          { $eq: [{ $type: '$mainCategoryDetails' }, 'missing'] },
                          { $eq: [{ $objectToArray: '$mainCategoryDetails' }, []] },
                        ],
                      },
                      then: null,
                      else: {
                        _id: '$mainCategoryDetails._id',
                        title: '$mainCategoryDetails.title.' + req.lang,
                      },
                    },
                  },
                  subCategories: {
                    $let: {
                      vars: {
                        subCat: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$mainCategoryDetails.subCategories',
                                cond: {
                                  $eq: [
                                    '$$this._id',
                                    '$creatives.mainCategory.subCategories.subCategory',
                                  ],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        $cond: {
                          if: { $eq: ['$$subCat', null] },
                          then: null,
                          else: {
                            subCategory: {
                              _id: '$$subCat._id',
                              title: { $getField: { field: req.lang, input: '$$subCat.title' } },
                            },
                            tags: {
                              $cond: {
                                if: { $eq: ['$creatives.mainCategory.subCategories.tags', null] },
                                then: null,
                                else: {
                                  $map: {
                                    input: '$creatives.mainCategory.subCategories.tags',
                                    as: 'tag',
                                    in: {
                                      $let: {
                                        vars: {
                                          tagData: {
                                            $arrayElemAt: [
                                              {
                                                $filter: {
                                                  input: '$$subCat.tags',
                                                  cond: { $eq: ['$$this._id', '$$tag.tag'] },
                                                },
                                              },
                                              0,
                                            ],
                                          },
                                        },
                                        in: {
                                          _id: '$$tag.tag',
                                          title: {
                                            $getField: { field: req.lang, input: '$$tagData' },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  relatedCategory: {
                    category: {
                      $cond: {
                        if: {
                          $or: [
                            { $eq: ['$relatedCategoryDetails', null] },
                            { $eq: [{ $type: '$relatedCategoryDetails' }, 'missing'] },
                            { $eq: [{ $objectToArray: '$relatedCategoryDetails' }, []] },
                          ],
                        },
                        then: null,
                        else: {
                          _id: '$relatedCategoryDetails._id',
                          title: '$relatedCategoryDetails.title.' + req.lang,
                        },
                      },
                    },
                    subCategories: {
                      $let: {
                        vars: {
                          subCat: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$relatedCategoryDetails.subCategories',
                                  cond: {
                                    $eq: [
                                      '$$this._id',
                                      '$creatives.mainCategory.relatedCategory.subCategories.subCategory',
                                    ],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: {
                          $cond: {
                            if: { $eq: ['$$subCat', null] },
                            then: null,
                            else: {
                              subCategory: {
                                _id: '$$subCat._id',
                                title: { $getField: { field: req.lang, input: '$$subCat.title' } },
                              },
                              tags: {
                                $cond: {
                                  if: {
                                    $eq: [
                                      '$creatives.mainCategory.relatedCategory.subCategories.tags',
                                      null,
                                    ],
                                  },
                                  then: null,
                                  else: {
                                    $map: {
                                      input:
                                        '$creatives.mainCategory.relatedCategory.subCategories.tags',
                                      as: 'tag',
                                      in: {
                                        $let: {
                                          vars: {
                                            tagData: {
                                              $arrayElemAt: [
                                                {
                                                  $filter: {
                                                    input: '$$subCat.tags',
                                                    cond: { $eq: ['$$this._id', '$$tag.tag'] },
                                                  },
                                                },
                                                0,
                                              ],
                                            },
                                          },
                                          in: {
                                            _id: '$$tag.tag',
                                            title: {
                                              $getField: { field: req.lang, input: '$$tagData' },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              null,
            ],
          },
        },
        doc: { $first: '$$ROOT' },
      },
    },

    {
      $replaceRoot: {
        newRoot: { $mergeObjects: ['$doc', { creatives: '$creatives' }] },
      },
    },

    {
      $lookup: {
        from: MODELS.favourites,
        let: { projectId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$project', '$$projectId'] },
                  {
                    $eq: [
                      '$user',
                      req.loggedUser?.id ? new Types.ObjectId(req.loggedUser.id) : null,
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'userFavourite',
      },
    },

    {
      $lookup: {
        from: MODELS.category,
        localField: 'relatedCategory.category',
        foreignField: '_id',
        as: 'relatedCategoryData',
      },
    },

    {
      $lookup: {
        from: MODELS.projectContract,
        let: { projectId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$project', '$$projectId'] },
                  {
                    $not: {
                      $in: [
                        '$status',
                        [
                          ProjectContractStatus.rejected,
                          ProjectContractStatus.completed,
                          ProjectContractStatus.canceled,
                        ],
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
        as: 'activeContract',
      },
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
          media: '$category.media',
        },
        subCategory: {
          title: '$subCategory.' + req.lang,
          _id: '$subCategory._id',
        },
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
              _id: '$$tag._id',
            },
          },
        },
        cover: { $concat: [process.env.BUCKET_HOST, '/', '$cover'] },
        audioCover: { $concat: [process.env.BUCKET_HOST, '/', '$audioCover'] },
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
          $filter: {
            input: '$creatives',
            as: 'creative',
            cond: { $ne: ['$$creative', null] },
          },
        },
        location: {
          lng: { $arrayElemAt: ['$location.coordinates', 0] },
          lat: { $arrayElemAt: ['$location.coordinates', 1] },
        },
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
            if: { $gt: [{ $size: '$userFavourite' }, 0] },
            then: true,
            else: false,
          },
        },
        favouriteCount: 1,
        relatedCategory: {
          $cond: {
            if: { $eq: [{ $ifNull: ['$relatedCategory', []] }, []] },
            then: [],
            else: {
              $filter: {
                input: {
                  $map: {
                    input: { $ifNull: ['$relatedCategory', []] },
                    as: 'related',
                    in: {
                      $let: {
                        vars: {
                          categoryData: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$relatedCategoryData',
                                  cond: { $eq: ['$$this._id', '$$related.category'] },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: {
                          $cond: {
                            if: { $eq: ['$$categoryData', null] },
                            then: null,
                            else: {
                              category: {
                                _id: '$$categoryData._id',
                                title: '$$categoryData.title.' + req.lang,
                                image: {
                                  $cond: {
                                    if: { $eq: ['$$categoryData.image', null] },
                                    then: null,
                                    else: {
                                      $concat: [
                                        process.env.BUCKET_HOST,
                                        '/',
                                        '$$categoryData.image',
                                      ],
                                    },
                                  },
                                },
                                subCategories: {
                                  $filter: {
                                    input: {
                                      $map: {
                                        input: { $ifNull: ['$$related.subCategories', []] },
                                        as: 'sub',
                                        in: {
                                          $let: {
                                            vars: {
                                              subCatData: {
                                                $arrayElemAt: [
                                                  {
                                                    $filter: {
                                                      input: {
                                                        $ifNull: [
                                                          '$$categoryData.subCategories',
                                                          [],
                                                        ],
                                                      },
                                                      cond: {
                                                        $eq: ['$$this._id', '$$sub.subCategory'],
                                                      },
                                                    },
                                                  },
                                                  0,
                                                ],
                                              },
                                            },
                                            in: {
                                              $cond: {
                                                if: { $eq: ['$$subCatData', null] },
                                                then: null,
                                                else: {
                                                  _id: '$$sub.subCategory',
                                                  title: '$$subCatData.title.' + req.lang,
                                                  tags: {
                                                    $filter: {
                                                      input: {
                                                        $map: {
                                                          input: { $ifNull: ['$$sub.tags', []] },
                                                          as: 'tagItem',
                                                          in: {
                                                            $let: {
                                                              vars: {
                                                                tagData: {
                                                                  $arrayElemAt: [
                                                                    {
                                                                      $filter: {
                                                                        input: {
                                                                          $ifNull: [
                                                                            '$$subCatData.tags',
                                                                            [],
                                                                          ],
                                                                        },
                                                                        cond: {
                                                                          $eq: [
                                                                            '$$this._id',
                                                                            '$$tagItem.tag',
                                                                          ],
                                                                        },
                                                                      },
                                                                    },
                                                                    0,
                                                                  ],
                                                                },
                                                              },
                                                              in: {
                                                                $cond: {
                                                                  if: { $eq: ['$$tagData', null] },
                                                                  then: null,
                                                                  else: {
                                                                    _id: '$$tagItem.tag',
                                                                    title:
                                                                      '$$tagItem.title.' + req.lang,
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                      cond: { $ne: ['$$this', null] },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                    cond: { $ne: ['$$this', null] },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                cond: { $ne: ['$$this', null] },
              },
            },
          },
        },
        canEdit: { $eq: [{ $size: '$activeContract' }, 0] },
      },
    },
  );

  pipelines.push(
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: req.pagination.skip,
    },
    {
      $limit: req.pagination.limit,
    },
  );

  const projects = await ProjectCycle.aggregate(pipelines);

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
