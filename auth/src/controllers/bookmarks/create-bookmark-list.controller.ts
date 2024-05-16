import { Bookmarks, Project } from '@duvdu-v1/duvdu';

import { CreateBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const createBookmarkHandler: CreateBookmarkHandler = async (req, res) => {
  const projects = await Project.find({ 'project.type': req.body.projects }, { _id: 1 });

  await Bookmarks.create({
    user: req.loggedUser?.id,
    title: req.body.title,
    projects: projects.map((el) => el._id),
  });
  res.status(200).json({ message: 'success' });
};
