import { NotFound, Bookmarks, Projects } from '@duvdu-v1/duvdu';

import { CreateBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const createBookmarkHandler: CreateBookmarkHandler = async (req, res, next) => {
  const project = await Projects.findOne({ _id: req.body.projects[0] });
  if (!project) return next(new NotFound());

  await Bookmarks.create({
    user: req.loggedUser?.id,
    title: req.body.title,
    projects: req.body.projects,
  });
  res.status(200).json({ message: 'success' });
};
