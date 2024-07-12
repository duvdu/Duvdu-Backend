import 'express-async-errors';

import { Contracts, MODELS, NotFound, ProjectCycle } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { GetProjectHandler } from '../../types/project.endoints';

export const getProjectHandler: GetProjectHandler = async (req, res, next) => {
  const projects = await ProjectCycle.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.params.projectId), isDeleted: { $ne: true } },
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
          profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$user.profileImage'] },
          coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$user.coverImage'] },
          category: {
            _id: 1,
            title: req.lang === 'en' ? '$user.category.title.en' : '$user.category.title.ar',
          },
          isOnline: '$user.isOnline',
          username: '$user.username',
          name: '$user.name',
          rank: '$user.rank',
          projectsView: '$user.projectsView',
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

  if (!projects[0])
    return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));
  const canChat = !!(await Contracts.findOne({
    $or: [
      { sp: req.loggedUser?.id, customer: projects[0].customer },
      { customer: req.loggedUser?.id, sp: projects[0].sp },
    ],
  }));
  projects[0].user.canChat = canChat;
  res.status(200).json({ message: 'success', data: projects[0] });
};
