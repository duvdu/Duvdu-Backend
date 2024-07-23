import 'express-async-errors';

import { NotAllowedError, ProjectReview } from '@duvdu-v1/duvdu';

import { DeleteReviewHandler } from '../../types/endpoints/projectView.endpoints';

export const deleteReviewHandler: DeleteReviewHandler = async (req, res, next) => {
  const review = await ProjectReview.findByIdAndDelete(req.params.reviewId);

  if (!review) return next(new NotAllowedError(undefined, req.lang));

  res.status(204).json({ message: 'success' });
};
