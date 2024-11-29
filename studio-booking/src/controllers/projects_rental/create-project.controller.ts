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

  const [{ filteredTags, subCategoryTitle }] = await Promise.all([
    filterTagsForCategory(
      req.body.category.toString(),
      req.body.subCategory,
      req.body.tags,
      CYCLES.studioBooking,
      req.lang,
    ),
    new Bucket().saveBucketFiles(FOLDERS.studio_booking, ...attachments, ...cover)
  ]);

  const projectData = {
    ...req.body,
    tags: filteredTags,
    subCategory: { ...subCategoryTitle, _id: req.body.subCategory },
    cover: `${FOLDERS.studio_booking}/${cover[0].filename}`,
    attachments: attachments.map((el) => `${FOLDERS.studio_booking}/${el.filename}`),
    user: req.loggedUser.id,
  };

  if (req.body.location) {
    projectData.location = {
      type: 'Point',
      coordinates: [(req as any).location.lng, (req as any).location.lat],
    };
  }

  const [project] = await Promise.all([
    Rentals.create(projectData),
    Files.removeFiles(...projectData.attachments, projectData.cover)
  ]);

  await Project.create({
    _id: project._id,
    project: { type: project.id, ref: 'rentals' },
    user: req.loggedUser.id,
    ref: 'rentals'
  });

  res.status(201).json({ message: 'success', data: project });
};
