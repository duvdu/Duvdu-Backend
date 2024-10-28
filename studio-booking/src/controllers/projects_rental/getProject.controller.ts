import { incrementProjectsView, MODELS, NotFound, Rentals, Contracts } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose, { Types } from 'mongoose';

export const getProjectHandler: RequestHandler = async (req, res, next) => {
  const pipelines = [
    {
      $set: {
        subCategory: {
          title: `$subCategory.${req.lang}`,
          _id: '$subCategory._id',
        },
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
      },
    },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: '$categoryDetails' },
    {
      $set: {
        category: {
          _id: '$categoryDetails._id',
          image: { $concat: [process.env.BUCKET_HOST, '/', '$categoryDetails.image'] },
          title: {
            $cond: {
              if: { $eq: [req.lang, 'ar'] },
              then: '$categoryDetails.title.ar',
              else: '$categoryDetails.title.en',
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $set: {
        user: {
          _id: '$userDetails._id',
          username: '$userDetails.username',
          profileImage: {
            $concat: [process.env.BUCKET_HOST, '/', '$userDetails.profileImage'],
          },
          coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$userDetails.coverImage'] },
          isOnline: '$userDetails.isOnline',
          acceptedProjectsCounter: '$userDetails.acceptedProjectsCounter',
          name: '$userDetails.name',
          rate: '$userDetails.rate',
          rank: '$userDetails.rank',
          projectsView: '$userDetails.projectsView',
          profileViews: '$userDetails.profileViews',
          about: '$userDetails.about',
          isAvaliableToInstantProjects: '$userDetails.isAvaliableToInstantProjects',
          pricePerHour: '$userDetails.pricePerHour',
          hasVerificationBadge: '$userDetails.hasVerificationBadge',
          likes: '$userDetails.likes',
          followCount: '$userDetails.followCount',
          address: '$userDetails.address',
        },
        attachments: {
          $map: {
            input: '$attachments',
            as: 'attachment',
            in: {
              $concat: [process.env.BUCKET_HOST, '/', '$$attachment'],
            },
          },
        },
        cover: {
          $concat: [process.env.BUCKET_HOST, '/', '$cover'],
        },
      },
    },
    {
      $unset: ['userDetails', 'categoryDetails'],
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
      $addFields: {
        isFavourite: {
          $cond: {
            if: {
              $eq: [
                '$favourite.user',
                req.loggedUser?.id ? new mongoose.Types.ObjectId(req.loggedUser.id as string) : '0',
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $addFields: {
        location: {
          lng: { $arrayElemAt: ['$location.coordinates', 0] },
          lat: { $arrayElemAt: ['$location.coordinates', 1] },
        },
      },
    },
    {
      $project: {
        favourite: 0,
      },
    },
  ];

  const project = (
    await Rentals.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(req.params.projectId),
          isDeleted: { $ne: true },
        },
      },
      ...pipelines,
    ])
  )[0];

  if (!project) return next(new NotFound(undefined, req.lang));

  await incrementProjectsView(project.user._id, 'rentals', project._id, req.lang);
  const canChat = !!(await Contracts.findOne({
    $or: [
      { sp: req.loggedUser?.id, customer: project.customer },
      { customer: req.loggedUser?.id, sp: project.sp },
    ],
  }));
  project.user.canChat = canChat;
  res.status(200).json({
    message: 'success',
    data: project,
  });
};
