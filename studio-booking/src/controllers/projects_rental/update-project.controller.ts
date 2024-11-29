import { Bucket, Files, FOLDERS, NotAllowedError, SuccessResponse, Rentals } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateProjectHandler: RequestHandler<{ projectId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
  const cover = <Express.Multer.File[] | undefined>(req.files as any)?.cover;

  const s3 = new Bucket();
  const uploadPromises: Promise<any>[] = [];

  // Prepare upload promises
  if (attachments) {
    uploadPromises.push(s3.saveBucketFiles(FOLDERS.studio_booking, ...attachments));
    req.body.attachments = attachments.map((el) => `${FOLDERS.studio_booking}/${el.filename}`);
    Files.removeFiles(...(req.body as any).attachments);
  }
  
  if (cover) {
    uploadPromises.push(s3.saveBucketFiles(FOLDERS.studio_booking, ...cover));
    req.body.cover = `${FOLDERS.studio_booking}/${cover[0].filename}`;
    Files.removeFiles(req.body.cover);
  }

  // Execute all uploads in parallel
  if (uploadPromises.length > 0) {
    await Promise.all(uploadPromises);
  }

  const project = await Rentals.findOneAndUpdate(
    { _id: req.params.projectId, user: req.loggedUser.id },
    req.body,
  );

  if (!project) return next(new NotAllowedError(undefined, req.lang));

  // Remove old files in parallel
  const removePromises: Promise<any>[] = [];
  if (attachments) removePromises.push(s3.removeBucketFiles(...project.attachments));
  if (cover) removePromises.push(s3.removeBucketFiles(project.cover));
  
  if (removePromises.length > 0) {
    await Promise.all(removePromises);
  }

  res.status(200).json({ message: 'success' });
};
