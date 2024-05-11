import { BadRequestError, BookingState, NotFound, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { CopyrightsBooking, IcopyrightsBooking } from '../../models/copyrights-booking.model';

// canceled .. by cronjob if project created from 24 hours
// pending .. targetUser can update to ongoing or rejected
// ongoing .. targetUser can update on submitFiles on complete
// completed .. not updated
// rejected .. not updated
export const updateBookedProjectHandler: RequestHandler<
  { bookingId: string },
  SuccessResponse<{ data: IcopyrightsBooking }>
> = async (req, res, next) => {
  const bookedProject = await CopyrightsBooking.findOne({
    _id: req.params.bookingId,
    targetUser: req.loggedUser.id,
  });
  if (!bookedProject) return next(new NotFound());

  if (bookedProject.state === BookingState.pending && req.body.state === BookingState.ongoing)
    await updatePendingToOngoing(bookedProject.id);
  else if (bookedProject.state === BookingState.pending && req.body.state === BookingState.rejected)
    await updatePendingToRejected(bookedProject.id);
  else if (
    bookedProject.state === BookingState.ongoing &&
    req.body.state === BookingState.completed
  )
    await updatePendingToCompleted(bookedProject);
  else return next(new BadRequestError(`booking is already ${bookedProject.state}`));

  (bookedProject as any)._doc.state = req.body.state;
  res.status(200).json({ message: 'success', data: bookedProject });
};

const updatePendingToOngoing = async (id: string) => {
  await CopyrightsBooking.updateOne({ _id: id }, { state: BookingState.ongoing });
  // TODO: send notification to source user that state has changed
};

const updatePendingToRejected = async (id: string) => {
  await CopyrightsBooking.updateOne({ _id: id }, { state: BookingState.rejected });
  // TODO: send notification to source user that state has changed
};

const updatePendingToCompleted = async (bookedProject: IcopyrightsBooking) => {
  const user = await Users.findOneAndUpdate(
    { _id: bookedProject.targetUser, avaliableContracts: { $gte: 1 } },
    { $inc: { avaliableContracts: -1, acceptedProjectsCounter: 1 } },
  );
  if (!user) throw new BadRequestError('check your bill first');

  await CopyrightsBooking.updateOne({ _id: bookedProject.id }, { state: BookingState.completed });
  // TODO: send notification to source user that state has changed
};
