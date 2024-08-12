import { Bookmarks, NotFound } from '@duvdu-v1/duvdu';

import { RemoveProjectFromBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const removeProjectFromBookmarkHandler: RemoveProjectFromBookmarkHandler = async (
  req,
  res,
  next,
) => {
  // const project = await Project.findOne({ 'project.type': req.params.projectId }, { _id: 1 });
  const bookmark = await Bookmarks.findOneAndUpdate(
    { _id: req.params.bookmarkId, user: req.loggedUser.id },
    {
      $pull: { projects: req.params.projectId },
    },
  );
  if (!bookmark) return next(new NotFound(undefined, req.lang));
  res.status(200).json({ message: 'success' });
};
