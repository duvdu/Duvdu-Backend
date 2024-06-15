import { incrementProjectsView, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

import { Rentals } from '../../models/rental.model';

export const getProjectHandler: RequestHandler = async (req, res) => {
  const pipelines = [
    {
      $set: {
        subCategory: {
          $cond: {
            if: {
              $eq: [req.lang, 'en'],
            },
            then: '$subCategory.en',
            else: '$subCategory.ar',
          },
        },
        tags: {
          $cond: {
            if: {
              $eq: [req.lang, 'en'],
            },
            then: '$tags.en',
            else: '$tags.ar',
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
    {
      $unwind: '$userDetails',
    },
    {
      $set: {
        user: {
          _id: '$userDetails._id',
          username: '$userDetails.username',
          profileImage: {
            $concat: [process.env.BUCKET_HOST, '$userDetails.profileImage'],
          },
          isOnline: '$userDetails.isOnline',
          acceptedProjectsCounter: '$userDetails.acceptedProjectsCounter',
          name: '$userDetails.name',
          rate: '$userDetails.rate',
          rank: '$userDetails.rank',
          projectsView: '$userDetails.projectsView',
        },
        attachments: {
          $map: {
            input: '$attachments',
            as: 'attachment',
            in: {
              $concat: [process.env.BUCKET_HOST, '$$attachment'],
            },
          },
        },
        cover: {
          $concat: [process.env.BUCKET_HOST, '$cover'],
        },
      },
    },
    {
      $unset: 'userDetails',
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

  if (req.loggedUser?.id) {
    const user = await Users.findById(req.loggedUser.id, { favourites: 1 });

    project.isFavourite = user?.favourites.some(
      (el: any) => el.project.toString() === project._id.toString(),
    );
  }
  await incrementProjectsView(project.user._id);

  res.status(200).json({
    message: 'success',
    data: project,
  });
};
