import 'express-async-errors';

import { MODELS, ProjectCycle } from '@duvdu-v1/duvdu';

import { GetProjectsForCrmHandler } from '../../types/project.endoints';

export const getProjetcsCrm: GetProjectsForCrmHandler = async (req, res) => {
  const projects = await ProjectCycle.aggregate([
    {
      $match: { ...req.pagination.filter },
    },
    { $sort: { createdAt: -1 } },
    {
      $skip: req.pagination.skip,
    },
    {
      $limit: req.pagination.limit,
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
      $lookup: {
        from: MODELS.user,
        localField: 'creatives',
        foreignField: '_id',
        as: 'creatives',
      },
    },
    {
      $project: {
        _id: 1,
        user: {
          _id:'$user._id',
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
          followCount:'$user.followCount',
          address:'$user.address',  
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
            in: '$$tag.' + req.lang,
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
              followCount:'$$creative.followCount',
              address:'$$creative.address',
              _id:'$$creative._id',
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
      },
    },
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
