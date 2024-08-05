import { MODELS, ProjectView, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const getTopProjectsViewsHandler: RequestHandler<
  unknown,
  SuccessResponse,
  unknown,
  unknown
> = async (req, res) => {
  const projects = await ProjectView.aggregate([
    {
      $group: {
        _id: '$project',
        totalViews: { $sum: '$count' },
        ref: { $first: '$ref' },
      },
    },
    {
      $sort: {
        totalViews: -1,
      },
    },
    {
      $limit: 20,
    },
    {
      $lookup: {
        from: MODELS.portfolioPost,
        let: { projectId: '$_id', ref: '$ref' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$projectId'] }, { $eq: ['$$ref', MODELS.portfolioPost] }],
              },
            },
          },
        ],
        as: 'portfolioPostDetails',
      },
    },
    {
      $lookup: {
        from: 'rentals',
        let: { projectId: '$_id', ref: '$ref' },
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: ['$_id', '$$projectId'] }, { $eq: ['$$ref', 'rentals'] }] },
            },
          },
        ],
        as: 'studioBookingDetails',
      },
    },
    {
      $unwind: {
        path: '$portfolioPostDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$studioBookingDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        projectDetails: {
          $cond: {
            if: { $eq: ['$ref', MODELS.portfolioPost] },
            then: '$portfolioPostDetails',
            else: '$studioBookingDetails',
          },
        },
      },
    },
    {
      $addFields: {
        'projectDetails.cover': {
          $concat: [process.env.BUCKET_HOST, '/', '$projectDetails.cover'],
        },
        'projectDetails.attachments': {
          $map: {
            input: '$projectDetails.attachments',
            as: 'attachment',
            in: {
              $concat: [process.env.BUCKET_HOST, '/', '$$attachment'],
            },
          },
        },
        'projectDetails.subCategory': `$projectDetails.subCategory.${req.lang}`,
        'projectDetails.tags': {
          $map: {
            input: '$projectDetails.tags',
            as: 'tag',
            in: {
              _id: '$$tag._id',
              title: {
                $cond: {
                  if: { $eq: ['ar', req.lang] },
                  then: '$$tag.ar',
                  else: '$$tag.en',
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        totalViews: 1,
        projectDetails: 1,
      },
    },
  ]);

  // Collect all projectDetails in one array
  const allProjectDetails = projects.reduce((acc, project) => {
    return acc.concat(project.projectDetails);
  }, []);

  res.status(200).json(<any>{ message: 'success', data: allProjectDetails });
};
