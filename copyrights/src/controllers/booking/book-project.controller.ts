import {
  BadRequestError,
  Bucket,
  CopyRights,
  NotFound,
  SuccessResponse,
  FOLDERS,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { CopyrightsBooking, IcopyrightsBooking } from '../../models/copyrights-booking.model';

export const bookProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: IcopyrightsBooking }>
> = async (req, res, next) => {
  // assert data
  if (req.body.targetUser === req.loggedUser.id.toString()) return next(new BadRequestError(''));
  const project = await CopyRights.findById(req.params.projectId, { _id: 1, user: 1 });
  if (!project) return next(new NotFound('Project not found'));

  // deal with media
  const attachments = req.files as Express.Multer.File[];
  if (attachments) {
    req.body.attachments = attachments.map((el) => FOLDERS.copyrights + '/' + el.filename);
    await new Bucket().saveBucketFiles(FOLDERS.copyrights, ...attachments);
  }

  // create booking
  const booking = await CopyrightsBooking.create({
    ...req.body,
    targetUser: project.user,
    sourceUser: req.loggedUser.id,
    project: req.params.projectId,
  });
  // TODO: send notification for target user with booking

  res.status(201).json({ message: 'success', data: booking });
};
