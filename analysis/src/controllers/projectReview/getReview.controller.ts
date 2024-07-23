import 'express-async-errors';

import { NotFound, ProjectReview } from '@duvdu-v1/duvdu';

import { GetProjectReviewHandler } from '../../types/endpoints/projectView.endpoints';

export const getProjectReviewHandler: GetProjectReviewHandler = async (req, res, next) => {
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
