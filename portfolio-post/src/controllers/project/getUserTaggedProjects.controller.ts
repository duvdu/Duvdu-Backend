import 'express-async-errors';

import {
  InviteStatus,
  IprojectCycle,
  MODELS,
  PaginationResponse,
  ProjectCycle,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { PipelineStage, Types } from 'mongoose';

import { GetProjectsHandler } from '../../types/project.endoints';

export const getUserTaggedProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IprojectCycle[] }>,
  GetProjectsHandler,
  unknown
> = async (req, res) => {
  const countPipeline = [
    {
      $match: {
        creatives: {
          $elemMatch: {
            creative: new Types.ObjectId(req.loggedUser?.id),
          },
        },
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
        creatives: {
          $elemMatch: {
            creative: new Types.ObjectId(req.loggedUser?.id),
          },
        },
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
  );

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
      $group: {
        _id: '$_id',
        creatives: {
          $push: {
            $cond: [
              { $eq: ['$creatives.inviteStatus', InviteStatus.accepted] },
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
                likes: '$creativeDetails.likes',
                followCount: '$creativeDetails.followCount',
                address: '$creativeDetails.address',
                inviteStatus: '$creatives.inviteStatus',
                mainCategory: {
                  category: {
                    $let: {
                      vars: {
                        filteredCategories: {
                          $filter: {
                            input: '$$creative.mainCategory.category',
                            as: 'cat',
                            cond: { $ne: ['$$cat', null] },
                          },
                        },
                      },
                      in: {
                        $cond: {
                          if: { $gt: [{ $size: '$$filteredCategories' }, 0] },
                          then: {
                            _id: { $arrayElemAt: ['$$filteredCategories._id', 0] },
                            title: { $arrayElemAt: ['$$filteredCategories.title', 0] },
                          },
                          else: null,
                        },
                      },
                    },
                  },
                  subCategories: {
                    $map: {
                      input: '$creatives.mainCategory.subCategories',
                      as: 'subCategory',
                      in: {
                        subCategory: {
                          $lookup: {
                            from: MODELS.category,
                            localField: 'subCategory.subCategory',
                            foreignField: '_id',
                            as: 'subCategoryData',
                          },
                        },
                        tags: {
                          $filter: {
                            input: '$subCategory.tags',
                            as: 'tag',
                            cond: { $ne: ['$$tag', null] },
                          },
                        },
                      },
                    },
                  },
                  relatedCategory: {
                    $cond: {
                      if: { $ne: ['$creatives.mainCategory.relatedCategory', null] },
                      then: {
                        category: {
                          $lookup: {
                            from: MODELS.category,
                            localField: 'creatives.mainCategory.relatedCategory.category',
                            foreignField: '_id',
                            as: 'relatedCategoryData',
                          },
                        },
                        subCategories: {
                          $map: {
                            input: '$creatives.mainCategory.relatedCategory.subCategories',
                            as: 'relatedSubCategory',
                            in: {
                              subCategory: {
                                $lookup: {
                                  from: MODELS.category,
                                  localField: 'relatedSubCategory.subCategory',
                                  foreignField: '_id',
                                  as: 'relatedSubCategoryData',
                                },
                              },
                              tags: {
                                $filter: {
                                  input: '$relatedSubCategory.tags',
                                  as: 'tag',
                                  cond: { $ne: ['$$tag', null] },
                                },
                              },
                            },
                          },
                        },
                      },
                      else: null,
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
          $map: {
            input: '$creatives',
            as: 'creative',
            in: {
              _id: '$$creative._id',
              profileImage: '$$creative.profileImage',
              isOnline: '$$creative.isOnline',
              username: '$$creative.username',
              name: '$$creative.name',
              rank: '$$creative.rank',
              projectsView: '$$creative.projectsView',
              coverImage: '$$creative.coverImage',
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
              inviteStatus: '$$creative.inviteStatus',
              mainCategory: {
                category: {
                  $let: {
                    vars: {
                      filteredCategories: {
                        $filter: {
                          input: '$$creative.mainCategory.category',
                          as: 'cat',
                          cond: { $ne: ['$$cat', null] },
                        },
                      },
                    },
                    in: {
                      $cond: {
                        if: { $gt: [{ $size: '$$filteredCategories' }, 0] },
                        then: {
                          _id: { $arrayElemAt: ['$$filteredCategories._id', 0] },
                          title: { $arrayElemAt: ['$$filteredCategories.title', 0] },
                        },
                        else: null,
                      },
                    },
                  },
                },
                subCategories: {
                  $map: {
                    input: '$$creative.mainCategory.subCategories',
                    as: 'subCategory',
                    in: {
                      subCategory: {
                        _id: '$$subCategory.subCategory._id',
                        title: `$$subCategory.subCategory.title.${req.lang}`,
                        tags: {
                          $map: {
                            input: '$$subCategory.tags',
                            as: 'tag',
                            in: {
                              title: `$$tag.title.${req.lang}`,
                              _id: '$$tag._id',
                            },
                          },
                        },
                      },
                    },
                  },
                },
                relatedCategory: {
                  $cond: {
                    if: { $ne: ['$creatives.mainCategory.relatedCategory', null] },
                    then: {
                      category: {
                        title: `$$creative.mainCategory.relatedCategory.category.title.${req.lang}`,
                        _id: '$$creative.mainCategory.relatedCategory.category._id',
                      },
                      subCategories: {
                        $map: {
                          input: '$$creative.mainCategory.relatedCategory.subCategories',
                          as: 'relatedSubCategory',
                          in: {
                            subCategory: {
                              _id: '$$relatedSubCategory.subCategory._id',
                              title: `$$relatedSubCategory.subCategory.title.${req.lang}`,
                              tags: {
                                $map: {
                                  input: '$$relatedSubCategory.tags',
                                  as: 'tag',
                                  in: {
                                    _id: '$$tag._id',
                                    title: `$$tag.title.${req.lang}`,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  else: null,
                },
              },
            },
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
      },
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
