import crypto from 'crypto';

import {
  BadRequestError,
  Bucket,
  CopyRights,
  NotFound,
  SuccessResponse,
  FOLDERS,
  Files,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { CopyrightsBooking } from '../../models/copyrights-booking.model';
// TODO: prevent user from booking from himself
export const bookProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: { paymentLink: string } }>
> = async (req, res, next) => {
  // assert data
  if (req.body.targetUser === req.loggedUser.id.toString()) return next(new BadRequestError(''));
  const project = await CopyRights.findById(req.params.projectId);
  if (!project) return next(new NotFound('Project not found'));

  // deal with media
  const attachments = req.files as Express.Multer.File[];
  if (attachments) {
    req.body.attachments = attachments.map((el) => FOLDERS.copyrights + '/' + el.filename);
    await new Bucket().saveBucketFiles(FOLDERS.copyrights, ...attachments);
    Files.removeFiles(...req.body.attachments);
  }

  // create booking
  const booking = await CopyrightsBooking.create({
    ...req.body,
    // TODO: fix create copytight days then update deadline calculation
    deadline: new Date(new Date(req.body.startDate).getTime() + 20 * 24 * 60 * 60 * 1000),
    totalPrice: project.price,
    targetUser: project.user,
    sourceUser: req.loggedUser.id,
    project: req.params.projectId,
    paymentSession: crypto.randomBytes(16).toString('hex'),
  });
  // TODO: send notification for target user with booking

  res.status(201).json({
    message: 'success',
    data: {
      paymentLink: `${req.protocol}://${req.hostname}/api/copyrights/book/pay/?session=${booking.paymentSession}`,
    },
  });
};
