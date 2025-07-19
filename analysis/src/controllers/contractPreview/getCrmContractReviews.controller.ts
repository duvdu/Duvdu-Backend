import 'express-async-errors';

import { ContractReview, IContractReview, PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getReviewsCrmHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IContractReview[] }>
> = async (req, res) => {
  const reviews = await ContractReview.find(req.pagination.filter)
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .sort({ createAt: -1 })
    .populate([
      {
        path: 'sp',
        select:
          'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
      },
      {
        path: 'customer',
        select:
          'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
      },
    ]);

  const resultCount = await ContractReview.countDocuments(req.pagination.filter);

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
