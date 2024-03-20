import { NotFound } from '@duvdu-v1/duvdu';

import { Bookmarks } from '../../models/Bookmark.model';
import { RemoveBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const removeBookmarkHandler: RemoveBookmarkHandler = async (req, res, next) => {
  const bookmark = await Bookmarks.findByIdAndDelete(req.params.bookmarkId);
  if (!bookmark) return next(new NotFound());

  res.status(204).json();
};
