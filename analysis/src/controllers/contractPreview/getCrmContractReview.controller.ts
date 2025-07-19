import 'express-async-errors';

import { ContractReview, IContractReview, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getReviewCrmHandler: RequestHandler<
  { reviewId: string },
  SuccessResponse<{ data: IContractReview }>
> = async (req, res, next) => {
  const review = await ContractReview.findById(req.params.reviewId).populate([
    {
      path: 'user',
      select: 'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
    },
    {
      path: 'sp',
      select: 'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
    },
  ]);

  if (!review)
    return next(
      new NotFound({ en: 'review not found', ar: 'لم يتم العثور على المراجعة' }, req.lang),
    );

  res.status(200).json({ message: 'success', data: review });
};
