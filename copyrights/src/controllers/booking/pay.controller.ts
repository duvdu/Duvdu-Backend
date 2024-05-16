import { BadRequestError, BookingState, Contracts, MODELS } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { CopyrightsBooking } from '../../models/copyrights-booking.model';

export const payBooking: RequestHandler = async (req, res, next) => {
  const book = await CopyrightsBooking.findOneAndUpdate(
    { paymentSession: req.query.session, state: BookingState.unpaid },
    { state: BookingState.paid },
  );
  if (!book) return next(new BadRequestError('invalid session'));

  // TODO: send notification to target user
  await Contracts.create({
    sourceUser: book.sourceUser,
    targetUser: book.targetUser,
    book: book.id,
    deadline: book.deadline,
    project: book.project,
    startDate: new Date(),
    ref: MODELS.copyrightsBooking,
  });

  res.status(200).json({ message: 'success' });
};
