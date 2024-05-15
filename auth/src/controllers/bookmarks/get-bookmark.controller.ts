import { Bookmarks, NotFound } from '@duvdu-v1/duvdu';

import { GetBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const getBookmarkHandler: GetBookmarkHandler = async (req, res, next) => {
  const bookmark = await Bookmarks.findById(req.params.bookmarkId)
    .select('title projects')
    .populate({ path: 'projects', populate: 'project' });
  if (!bookmark) return next(new NotFound());
  res.status(200).json({ message: 'success', data: bookmark });
};
