import 'express-async-errors';
import {
  BadRequestError,
  Bucket,
  Files,
  FOLDERS,
  IstudioBooking,
  NotAllowedError,
  NotFound,
  studioBooking,
  Users,
} from '@duvdu-v1/duvdu';

import { createInvitedUsers } from '../../services/create-invited-users';
import { UpdateProjectHandler } from '../../types/endpoints/endpoints';


export const updateProjectHandler: UpdateProjectHandler = async (req, res, next) => {
  const { projectId } = req.params;
  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
  const cover = <Express.Multer.File[] | undefined>(req.files as any)?.cover;
  const project = await studioBooking.findById(projectId);
  if (!project) return next(new NotFound('project not found'));
  if (project.user.toString() != req.loggedUser.id)
    return next(new NotAllowedError('user not owner for this project'));

  if (req.body.creatives) {
    const creativesCount = await Users.countDocuments({
      _id: req.body.creatives.map((el: any) => el.creative),
    });
    if (creativesCount !== req.body.creatives.length)
      return next(new BadRequestError('invalid cretives'));
  }
  if (req.body.invitedCreatives) {
    const invitedCreatives = await createInvitedUsers(req.body.invitedCreatives);
    req.body.creatives
      ? req.body.creatives.push(invitedCreatives as any)
      : (req.body.creatives = invitedCreatives as any);
  }

  const s3 = new Bucket();
  if (attachments) {
    await s3.saveBucketFiles(FOLDERS.studio_booking, ...attachments);
    (req.body as any).attachments = attachments.map(
      (el) => `${FOLDERS.studio_booking}/${el.filename}`,
    );
    await s3.removeBucketFiles(...project.attachments);
    Files.removeFiles(...(req.body as any).attachments);
  }
  if (cover) {
    await s3.saveBucketFiles(FOLDERS.studio_booking, ...cover);
    req.body.cover = `${FOLDERS.studio_booking}/${cover[0].filename}`;
    await s3.removeBucketFiles(project.cover);
    Files.removeFiles(req.body.cover);
  }

  const updateProject = <IstudioBooking>(
    await studioBooking.findByIdAndUpdate(projectId, req.body, { new: true })
  );
  res.status(200).json({ message: 'success', data: updateProject });
};
