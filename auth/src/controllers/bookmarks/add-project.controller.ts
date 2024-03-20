import { NotFound } from '@duvdu-v1/duvdu';

import { Bookmarks } from '../../models/Bookmark.model';
import { AddProjectToBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const addProjectToBookmarksHandler: AddProjectToBookmarkHandler = async (req, res, next) => {
  const bookmark = await Bookmarks.findByIdAndUpdate(req.params.bookmarkId, {
    $addToSet: { projects: req.params.projectId },
  });
  if (!bookmark) return next(new NotFound());
  res.status(200).json({ message: 'success' });
};
