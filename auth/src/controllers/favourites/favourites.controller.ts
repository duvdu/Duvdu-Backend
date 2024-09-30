import { SuccessResponse, Favourites, MODELS } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose, { PipelineStage } from 'mongoose';

export const addToFavourite: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: any }>
> = async (req, res, next) => {
  try {
    const post = await Favourites.create({
      project: req.params.projectId,
      user: req.loggedUser.id,
    });
    res.json({ message: 'success', data: post });
  } catch (error) {
    res.status(200).json({ message: 'cannot add this project' as any, data: {} });
  }
};

export const removeFromFavourite: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: any }>
> = async (req, res, next) => {
  const post = await Favourites.deleteOne({
    project: req.params.projectId,
    user: req.loggedUser.id,
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
        ref: 1,
        rate: 1,
        createdAt: 1,
        updatedAt: 1,
        details: 1,
      },
    },
  ];
  const posts = await Favourites.aggregate(pipelines);
  res.json({ message: 'success', data: posts });
};
