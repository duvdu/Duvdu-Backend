import { Bookmarks, NotAllowedError, NotFound } from '@duvdu-v1/duvdu';

import { RemoveBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const removeBookmarkHandler: RemoveBookmarkHandler = async (req, res, next) => {
  const bookmark = await Bookmarks.findOne({ _id: req.params.bookmarkId, user: req.loggedUser.id });
  if (!bookmark) return next(new NotFound());
  if (bookmark.title === 'favourite')
    return next(new NotAllowedError('cannot remove favoutite board'));
  await Bookmarks.deleteOne({ _id: req.params.bookmarkId });

  res.status(204).json();
};
