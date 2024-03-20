import { NotFound } from '@duvdu-v1/duvdu';

import { Bookmarks } from '../../models/Bookmark.model';
import { UpdateBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const updateBookmarkHandler: UpdateBookmarkHandler = async (req, res, next) => {
  const bookmark = await Bookmarks.findByIdAndUpdate(req.params.bookmarkId, {
    title: req.body.title,
  });

  if (!bookmark) return next(new NotFound());
  res.status(200).json({ message: 'success' });
};
