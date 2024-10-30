import { SuccessResponse, BookmarkProjects } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose, {  PipelineStage } from 'mongoose';

export const addToBookmark: RequestHandler<
  { bookmarkId: string; projectId: string },
  SuccessResponse<{ data: any }>
> = async (req, res) => {
  try {
    const project = await BookmarkProjects.create({
      user: req.loggedUser.id,
      bookmark: req.params.bookmarkId,
      project: req.params.projectId,
    });
    res.status(200).json({ message: 'success', data: project });
  } catch (error) {
    res.status(200).json({ message: 'cannot add this project' as any, data: {} });
  }
};

export const removeFromBookmark: RequestHandler<
  { bookmarkId: string; projectId: string },
  SuccessResponse<{ data: any }>
> = async (req, res) => {
  const project = await BookmarkProjects.deleteOne({
    user: req.loggedUser.id,
    bookmark: req.params.bookmarkId,
    project: req.params.projectId,
  });

  res.status(200).json({ message: 'success', data: project });
};

export const getBookmarkProjects: RequestHandler<
  { bookmarkId: string },
  SuccessResponse<{ data: any }>
> = async (req, res) => {
  const pipelines: PipelineStage[] = [
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.loggedUser.id as string),
        bookmark: new mongoose.Types.ObjectId(req.params.bookmarkId),
      },
    },
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
      $lookup: {
        from: 'favourites',
        localField: '_id',
        foreignField: 'project',
        as: 'favourite',
      },
    },
    // {
    //   $unwind: { path: '$favourite', preserveNullAndEmptyArrays: true },
    // },
    {
      $project: {
        _id: 1,
        cycle: {
          $cond: {
            if: { $eq: ['$ref', 'portfolio-post'] },
            then: 'project',
            else: '$ref',
          },
        },
        createdAt: 1,
        updatedAt: 1,
        details: 1,
        isFavourite: {
          $cond: {
            if: {
              $eq: ['$favourite.user', new mongoose.Types.ObjectId(req.loggedUser.id as string)],
            },
            then: true,
            else: false,
          },
        },
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
  const projects = await BookmarkProjects.aggregate(pipelines);
  res.status(200).json({ message: 'success', data: projects });
};
