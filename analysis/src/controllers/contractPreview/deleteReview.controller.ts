import 'express-async-errors';

import { ContractReview, NotAllowedError } from '@duvdu-v1/duvdu';

import { DeleteReviewHandler } from '../../types/endpoints/contractReview.endpoints';

export const deleteReviewHandler: DeleteReviewHandler = async (req, res, next) => {
  const review = await ContractReview.findByIdAndDelete(req.params.reviewId);

  if (!review) return next(new NotAllowedError(undefined, req.lang));

  res.status(204).json({ message: 'success' });
};
