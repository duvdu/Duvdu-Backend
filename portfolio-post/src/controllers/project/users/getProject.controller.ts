import 'express-async-errors';

import {
  Contracts,
  incrementProjectsView,
  InviteStatus,
  MODELS,
  NotFound,
  ProjectContractStatus,
  ProjectCycle,
} from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { GetProjectHandler } from '../../../types/project.endoints';

export const getProjectHandler: GetProjectHandler = async (req, res, next) => {
  try {
    const projects = await ProjectCycle.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.projectId),
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
                    {
                      $or: [
                        {
                          $eq: [
                            new mongoose.Types.ObjectId(
                              req.loggedUser?.id || '000000000000000000000000',
                            ),
                            '$user._id',
                          ],
                        },
                        { $eq: ['$creatives.inviteStatus', InviteStatus.accepted] },
                      ],
                    },
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
                  likes: '$creativeDetails.likes',
                  followCount: '$creativeDetails.followCount',
                  haveInvitation: '$creativeDetails.haveInvitation',
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
                          media: '$mainCategoryDetails.media',
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
                                title: {
                                  $getField: { field: req.lang, input: '$$subCat.title' },
                                },
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
                                  title: {
                                    $getField: { field: req.lang, input: '$$subCat.title' },
                                  },
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
                        new mongoose.Types.ObjectId(
                          req.loggedUser?.id || '000000000000000000000000',
                        ),
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'favourite',
        },
      },

      {
        $addFields: {
          isFavourite: { $gt: [{ $size: '$favourite' }, 0] },
          favouriteCount: { $size: '$favourite' },
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

      // Single consolidated $project stage
      {
        $project: {
          _id: 1,
          user: {
            _id: '$user._id',
            profileImage: {
              $concat: [process.env.BUCKET_HOST, '/', { $trim: { input: '$user.profileImage' } }],
            },
            isOnline: '$user.isOnline',
            username: '$user.username',
            name: '$user.name',
            rank: '$user.rank',
            projectsView: '$user.projectsView',
            coverImage: {
              $concat: [process.env.BUCKET_HOST, '/', { $trim: { input: '$user.coverImage' } }],
            },
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
                title: '$$tag.title.' + req.lang,
                _id: '$$tag._id',
              },
            },
          },
          cover: { $concat: [process.env.BUCKET_HOST, '/', { $trim: { input: '$cover' } }] },
          audioCover: {
            $cond: {
              if: { $eq: ['$audioCover', null] },
              then: null,
              else: {
                $concat: [process.env.BUCKET_HOST, '/', { $trim: { input: '$audioCover' } }],
              },
            },
          },
          attachments: {
            $map: {
              input: '$attachments',
              as: 'attachment',
              in: { $concat: [process.env.BUCKET_HOST, '/', { $trim: { input: '$$attachment' } }] },
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
          ticketNumber: 1,
          showOnHome: 1,
          projectScale: 1,
          rate: 1,
          updatedAt: 1,
          createdAt: 1,
          isFavourite: 1,
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
                                                                    if: {
                                                                      $eq: ['$$tagData', null],
                                                                    },
                                                                    then: null,
                                                                    else: {
                                                                      _id: '$$tagItem.tag',
                                                                      title:
                                                                        '$$tagItem.title.' +
                                                                        req.lang,
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
    ]);

    if (!projects[0]) {
      return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));
    }

    // Filter out projects where showOnHome is false and the logged user is not the owner or not logged in
    if (
      projects[0].showOnHome === false &&
      (!req.loggedUser?.id || req.loggedUser?.id !== projects[0].user._id.toString())
    ) {
      return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));
    }

    await incrementProjectsView(
      projects[0].user._id,
      MODELS.portfolioPost,
      projects[0]._id,
      req.lang,
    );

    const canChat = !!(await Contracts.findOne({
      $or: [
        { sp: req.loggedUser?.id, customer: projects[0].customer },
        { customer: req.loggedUser?.id, sp: projects[0].sp },
      ],
    }).populate({
      path: 'contract',
      match: {
        status: { $nin: ['canceled', 'pending', 'rejected', 'reject', 'cancel'] },
      },
    }));

    projects[0].user.canChat = canChat;

    res.status(200).json({ message: 'success', data: projects[0] });
  } catch (error) {
    next(error);
  }
};
