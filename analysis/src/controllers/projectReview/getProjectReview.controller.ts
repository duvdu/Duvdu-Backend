import 'express-async-errors';

import { IProjectReview, NotFound, ProjectReview, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getProjectReviewCrmHandler: RequestHandler<
  { reviewId: string },
  SuccessResponse<{ data: IProjectReview }>
> = async (req, res, next) => {
  const review = await ProjectReview.findById(req.params.reviewId).populate([
    {
      path: 'user',
      select: 'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
    },
  ]);

  if (!review)
    return next(
      new NotFound({ en: 'review not found', ar: 'لم يتم العثور على المراجعة' }, req.lang),
    );

  res.status(200).json({ message: 'success', data: review });
};
