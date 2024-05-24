import { Bookmarks, NotAllowedError, NotFound } from '@duvdu-v1/duvdu';

import { UpdateBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const updateBookmarkHandler: UpdateBookmarkHandler = async (req, res, next) => {
  const bookmark = await Bookmarks.findOne({ _id: req.params.bookmarkId, user: req.loggedUser.id });
  if (!bookmark) return next(new NotFound());
  if (bookmark.title === 'favourite')
    return next(new NotAllowedError('cannot update this bookmark'));

  res.status(200).json({ message: 'success', data: { title: req.body.title } });
};
