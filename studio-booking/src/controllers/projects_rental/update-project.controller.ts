import { Bucket, Files, FOLDERS, NotAllowedError, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Rentals } from '../../models/rental.model';

export const updateProjectHandler: RequestHandler<{ projectId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
  const cover = <Express.Multer.File[] | undefined>(req.files as any)?.cover;

  const s3 = new Bucket();
  if (attachments) {
    await s3.saveBucketFiles(FOLDERS.studio_booking, ...attachments);
    req.body.attachments = attachments.map((el) => `${FOLDERS.studio_booking}/${el.filename}`);
    Files.removeFiles(...(req.body as any).attachments);
  }
  if (cover) {
    await s3.saveBucketFiles(FOLDERS.studio_booking, ...cover);
    req.body.cover = `${FOLDERS.studio_booking}/${cover[0].filename}`;
    Files.removeFiles(req.body.cover);
  }

  const project = await Rentals.findOneAndUpdate(
    { _id: req.params.projectId, user: req.loggedUser.id },
    req.body,
  );

  if (!project) return next(new NotAllowedError(undefined, req.lang));

  attachments && (await s3.removeBucketFiles(...project.attachments));
  cover && (await s3.removeBucketFiles(project.cover));

  res.status(200).json({ message: 'success' });
};
