import {
  BadRequestError,
  Bucket,
  Categories,
  Files,
  FOLDERS,
  NotFound,
  studioBooking,
  Users,
} from '@duvdu-v1/duvdu';

import { createInvitedUsers } from '../../services/create-invited-users';
import { CreateProjectHandler } from '../../types/endpoints/endpoints';

export const createProjectHandler: CreateProjectHandler = async (req, res, next) => {

  const attachments = <Express.Multer.File[]>(req.files as any).attachments;
  const cover = <Express.Multer.File[]>(req.files as any).cover;

  const category = await Categories.findById(req.body.category);
  if (!category) return next(new NotFound(`category not found ${req.body.category}`));
  if (category.cycle != 2)
    return next(new BadRequestError('this category not related to this cycle'));

  if (req.body.creatives) {
    const creativeCount = await Users.countDocuments({
      _id: req.body.creatives.map((el: any) => el.creative),
    });
    if (req.body.creatives.length != creativeCount)
      return next(new BadRequestError('invalid cretaives'));
  }

  let invitedCreatives;
  if (req.body.invitedCreatives)
    invitedCreatives = await createInvitedUsers(req.body.invitedCreatives);

  const project = await studioBooking.create({
    ...req.body,
    creatives: [...(req.body.creatives || []), ...(invitedCreatives || [])],
    user: req.loggedUser.id,
  });

  await new Bucket().saveBucketFiles(FOLDERS.studio_booking, ...attachments, ...cover);
  project.cover = `${FOLDERS.studio_booking}/${cover[0].filename}`;
  project.attachments = attachments.map((el) => `${FOLDERS.studio_booking}/${el.filename}`);
  await project.save();
  Files.removeFiles(...project.attachments, project.cover);

  res.status(201).json({ message: 'success', data: project });
};
