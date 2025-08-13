import 'express-async-errors';

import { InviteStatus, MODELS, ProjectCycle } from '@duvdu-v1/duvdu';

import { GetProjectsForCrmHandler } from '../../../types/project.endoints';

export const getProjetcsCrm: GetProjectsForCrmHandler = async (req, res) => {

  
  const projects = await ProjectCycle.aggregate([
    {
      $match: req.pagination.filter,
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
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },

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
                        title: req.forceLang? '$mainCategoryDetails.title.' + req.lang : '$mainCategoryDetails.title',
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
                                $cond: {
                                  if: req.forceLang,
                                  then: { $getField: { field: req.lang, input: '$$subCat.title' } },
                                  else: '$$subCat.title',
                                },
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
                                            $cond: {
                                              if: req.forceLang,
                                              then: { $getField: { field: req.lang, input: '$$tagData' } },
                                              else: '$$tagData',
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
                          title: req.forceLang
                            ? '$relatedCategoryDetails.title.' + req.lang
                            : '$relatedCategoryDetails.title',
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
                                  $cond: {
                                    if: req.forceLang,
                                    then: { $getField: { field: req.lang, input: '$$subCat.title' } },
                                    else: '$$subCat.title',
                                  },
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
                                              $cond: {
                                                if: req.forceLang,
                                                then: { $getField: { field: req.lang, input: '$$tagData' } },
                                                else: '$$tagData',
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
          $cond: {
            if: { $eq: ['$category', null] },
            then: null,
            else: {
              title: req.forceLang ? '$category.title.' + req.lang : '$category.title',
              _id: '$category._id',
            },
          },
        },
        subCategory: {
          title: req.forceLang ? '$subCategory.' + req.lang : '$subCategory',
          _id: '$subCategory._id',
        },
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: {
              title: {
                $cond: {
                  if: req.forceLang,
                  then: { $getField: { field: req.lang, input: '$$tag' } },
                  else: '$$tag',
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
        ticketNumber: 1,
        functions: 1,
        creatives: {
          $filter: {
            input: '$creatives',
            as: 'creative',
            cond: { $ne: ['$$creative', null] }, // Filter out null values
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
        favouriteCount: 1,
        isDeleted: 1,
      },
    },
    // Group by _id to ensure no duplicate projects
    {
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' }
      }
    },
    {
      $replaceRoot: {
        newRoot: '$doc'
      }
    },
    { $sort: { createdAt: req.query.sortOrder === 'asc' ? 1 : -1 } },
    { $skip: req.pagination.skip },
    { $limit: req.pagination.limit },
  ]);
  const resultCount = await ProjectCycle.countDocuments(req.pagination.filter);

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
