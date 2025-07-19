import 'express-async-errors';

import { ContractReview, NotAllowedError, NotFound } from '@duvdu-v1/duvdu';

import { updateUserRate } from './createReview.controller';
import { UpdateReviewHandler } from '../../types/endpoints/contractReview.endpoints';

export const updateReviewHandler: UpdateReviewHandler = async (req, res, next) => {
  const review = await ContractReview.findById(req.params.reviewId);

  if (!review)
    return next(
      new NotFound({ en: 'review not found', ar: 'لم يتم العثور على المراجعة' }, req.lang),
    );

  if (review.customer.toString() != req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));

  const updatedReview = await ContractReview.findByIdAndUpdate(req.params.reviewId, req.body, {
    new: true,
  });

  // Only update rate if it's changed
  if (req.body.rate && review.rate !== req.body.rate) {
    // Remove old rate first
    await updateUserRate(review.sp.toString(), review.rate, false, req.lang);
    // Add new rate
    await updateUserRate(review.sp.toString(), req.body.rate, true, req.lang);
  }

  res.status(200).json({ message: 'success', data: updatedReview! });
};
