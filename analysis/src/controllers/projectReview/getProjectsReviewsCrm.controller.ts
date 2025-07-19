import 'express-async-errors';

import { IProjectReview, PaginationResponse, ProjectReview } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getProjectReviewsCrmHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IProjectReview[] }>
> = async (req, res) => {
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
