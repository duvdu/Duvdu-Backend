import 'express-async-errors';

import { ProjectReview } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { GetProjectReviewsHandler } from '../../types/endpoints/projectView.endpoints';

export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    project?: string;
    user?: string;
  }
> = (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.search)
    req.pagination.filter.$or = [{ comment: { $regex: req.query.search, $options: 'i' } }];

  if (req.query.user) req.pagination.filter.user = new mongoose.Types.ObjectId(req.query.user);

  if (req.query.project)
    req.pagination.filter.project = new mongoose.Types.ObjectId(req.query.project);

  next();
};

export const getProjectReviewsHandler: GetProjectReviewsHandler = async (req, res) => {
  const reviews = await ProjectReview.find(req.pagination.filter)
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .populate([
      {
        path: 'user',
        select:
          'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
      },
    ]);

  const resultCount = await ProjectReview.countDocuments(req.pagination.filter);

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: reviews,
  });
};
