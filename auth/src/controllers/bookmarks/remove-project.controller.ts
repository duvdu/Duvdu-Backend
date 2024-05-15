import { Bookmarks, NotFound, Project } from '@duvdu-v1/duvdu';

import { RemoveProjectFromBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const removeProjectFromBookmarkHandler: RemoveProjectFromBookmarkHandler = async (
  req,
  res,
  next,
) => {
  const project = await Project.findOne({ 'project.type': req.params.projectId }, { _id: 1 });
  const bookmark = await Bookmarks.findByIdAndUpdate(req.params.bookmarkId, {
    $pull: { projects: project?._id },
  });
  if (!bookmark) return next(new NotFound());
  res.status(200).json({ message: 'success' });
};
