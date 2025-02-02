import 'express-async-errors';
import { SuccessResponse, Favourites, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose, { PipelineStage } from 'mongoose';

import { sendNotification } from './sendNotification';

export const addToFavourite: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: any }>
> = async (req, res) => {

  const post = await Favourites.create({
    project: req.params.projectId,
    user: req.loggedUser.id,
  });

  await Users.findByIdAndUpdate(req.loggedUser.id, {
    $inc: { likes: 1 },
  });

  const projectFavourite = await Favourites.findOne({project: req.params.projectId} ).populate('project');


  if ((projectFavourite?.project as any).user) {
    await sendNotification(
      req.loggedUser.id,
      (projectFavourite?.project as any).user.toString(),
      req.params.projectId,
      'newFavorite',
      'New Favorite Project',
      'New Favorite Project Added from your projects',
      'favorites',
    );
  }

  res.json({ message: 'success', data: post });
};

export const removeFromFavourite: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: any }>
> = async (req, res) => {
  const post = await Favourites.deleteOne({
    project: req.params.projectId,
    user: req.loggedUser.id,
  });

  await Users.findOneAndUpdate({_id:req.loggedUser.id , likes: {$gt: 0}}, {
    $inc: { likes: -1 },
  });

  res.json({ message: 'success', data: post });
};

export const getFavourites: RequestHandler<unknown, SuccessResponse<{ data: any }>> = async (
  req,
  res,
) => {
  const pipelines: PipelineStage[] = [
    { $match: { user: new mongoose.Types.ObjectId(req.loggedUser.id as string) } },
    {
      $lookup: {
        from: 'allProjects',
        localField: 'project',
        foreignField: 'project.type',
        as: 'project',
      },
    },
    {
      $unwind: {
        path: '$project',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        project: { $ne: null },
      },
    },
    {
      $replaceRoot: {
        newRoot: { $ifNull: ['$project', {}] },
      },
    },
    {
      $lookup: {
        from: 'rentals',
        localField: 'project.type',
        foreignField: '_id',
        as: 'rentalDetails',
      },
    },
    {
      $lookup: {
        from: 'portfolio-post',
        localField: 'project.type',
        foreignField: '_id',
        as: 'portfolioDetails',
      },
    },
    {
      $addFields: {
        details: {
          $ifNull: [
            {
              $arrayElemAt: ['$portfolioDetails', 0],
            },
            { $arrayElemAt: ['$rentalDetails', 0] },
          ],
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'details.user',
        foreignField: '_id',
        as: 'details.user',
      },
    },
    { $unwind: { path: '$details.user', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'categories',
        localField: 'details.category',
        foreignField: '_id',
        as: 'details.category',
      },
    },
    {
      $unwind: {
        path: '$details.category',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        'details.cover': {
          $concat: [process.env.BUCKET_HOST, '/', '$details.cover'],
        },
        'details.audioCover': {
          $concat: [process.env.BUCKET_HOST, '/', '$details.audioCover'],
        },
        'details.attachments': {
          $map: {
            input: '$details.attachments',
            as: 'attachment',
            in: {
              $concat: [process.env.BUCKET_HOST, '/', '$$attachment'],
            },
          },
        },
        'details.tags': {
          $map: {
            input: '$details.tags',
            as: 'tag',
            in: `$$tag.${req.lang}`,
          },
        },
        'details.category': {
          title: `$details.category.title.${req.lang}`,
        },
        'details.subCategory': `$details.subCategory.${req.lang}`,
      },
    },
    {
      $project: {
        cycle: {
          $cond: {
            if: { $eq: ['$ref', 'portfolio-post'] },
            then: 'project',
            else: '$ref',
          },
        },
        rate: 1,
        createdAt: 1,
        updatedAt: 1,
        details: 1,
      },
    },
    {
      $set: {
        user: {
          _id: '$details.user._id',
          name: '$details.user.name',
          username: '$details.user.username',
          profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$details.user.profileImage'] },
        },
      },
    },
    {
      $project: {
        'details.user': 0,
      },
    },
    {
      $addFields: {
        'details.user': '$user',
      },
    },
    { $unset: ['user'] },
  ];
  const posts = await Favourites.aggregate(pipelines);
  res.json({ message: 'success', data: posts });
};
