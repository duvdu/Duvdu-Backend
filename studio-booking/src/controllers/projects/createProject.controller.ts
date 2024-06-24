import 'express-async-errors';
import {
  BadRequestError,
  Bucket,
  Files,
  FOLDERS,
  MODELS,
  Project,
  studioBooking,
  Users,
  CYCLES,
  filterTagsForCategory,
} from '@duvdu-v1/duvdu';

import { createInvitedUsers } from '../../services/create-invited-users';
import { CreateProjectHandler } from '../../types/endpoints/endpoints';

export const createProjectHandler: CreateProjectHandler = async (req, res, next) => {
  try {
    const attachments = <Express.Multer.File[]>(req.files as any).attachments;
    const cover = <Express.Multer.File[]>(req.files as any).cover;

    const { filteredTags, subCategoryTitle } = await filterTagsForCategory(
      req.body.category.toString(),
      req.body.subCategory,
      req.body.tags,
      CYCLES.studioBooking,
      req.lang
    );

    (req.body.tags as any) = filteredTags;
    (req.body.subCategory as any) = subCategoryTitle;

    if (req.body.creatives) {
      const creativeCount = await Users.countDocuments({
        _id: req.body.creatives.map((el: any) => el.creative),
      });
      if (req.body.creatives.length != creativeCount)
        return next(
          new BadRequestError({ en: 'invalid cretaives', ar: 'الإبداعات غير صالحة' }, req.lang),
        );
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

    await Project.create({
      project: {
        type: project.id,
        ref: MODELS.studioBooking,
      },
      user: req.loggedUser.id,
      ref: MODELS.studioBooking,
    });

    res.status(201).json({ message: 'success', data: project });
  } catch (error) {
    next(error);
  }
};
