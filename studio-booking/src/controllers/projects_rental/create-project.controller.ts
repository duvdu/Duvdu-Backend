import {
  Bucket,
  Rentals,
  CYCLES,
  Files,
  filterTagsForCategory,
  FOLDERS,
  Project,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const createProjectHandler: RequestHandler = async (req, res) => {
  const attachments = <Express.Multer.File[]>(req.files as any).attachments;
  const cover = <Express.Multer.File[]>(req.files as any).cover;

  const { filteredTags, subCategoryTitle } = await filterTagsForCategory(
    req.body.category.toString(),
    req.body.subCategory,
    req.body.tags,
    CYCLES.studioBooking,
    req.lang,
  );

  req.body.tags = filteredTags;
  req.body.subCategory = subCategoryTitle;

  await new Bucket().saveBucketFiles(FOLDERS.studio_booking, ...attachments, ...cover);
  req.body.cover = `${FOLDERS.studio_booking}/${cover[0].filename}`;
  req.body.attachments = attachments.map((el) => `${FOLDERS.studio_booking}/${el.filename}`);
  Files.removeFiles(...req.body.attachments, req.body.cover);

  const project = await Rentals.create({ ...req.body, user: req.loggedUser.id });

  await Project.create({
    project: { type: project.id, ref: 'rentals' },
    user: req.loggedUser.id,
    ref: 'rentals',
  });

  res.status(201).json({ message: 'success', data: project });
};
