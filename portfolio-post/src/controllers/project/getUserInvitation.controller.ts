import {
  InviteStatus,
  IprojectCycle,
  MODELS,
  ProjectCycle,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';

export const getUserInvitationHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: IprojectCycle[] }>,
  unknown,
  unknown
> = async (req, res) => {
  const projects = await ProjectCycle.aggregate([
    {
      $match: {
        isDeleted: { $ne: true },
        creatives: {
          $elemMatch: {
            creative: new mongoose.Types.ObjectId(req.loggedUser.id),
            inviteStatus: InviteStatus.pending,
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
        creatives: {
          $filter: {
            input: '$creatives',
            as: 'creative',
            cond: { $ne: ['$$creative', null] },
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
    },
  ]);

  res.status(200).json({ message: 'success', data: projects });
};
