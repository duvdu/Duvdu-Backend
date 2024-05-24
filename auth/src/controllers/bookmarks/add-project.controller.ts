import { Bookmarks, NotFound, Project } from '@duvdu-v1/duvdu';

import { AddProjectToBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const addProjectToBookmarksHandler: AddProjectToBookmarkHandler = async (req, res, next) => {
  const project = await Project.findOne({ 'project.type': req.params.projectId }, { _id: 1 });
  const bookmark = await Bookmarks.findOneAndUpdate(
    { _id: req.params.bookmarkId, user: req.loggedUser.id },
    {
      $addToSet: { projects: project?._id },
    },
  );
  if (!bookmark) return next(new NotFound());
  res.status(200).json({ message: 'success' });
};
