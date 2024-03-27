import { NotFound , Bookmarks } from '@duvdu-v1/duvdu';

import { GetBookmarksHandler } from '../../types/endpoints/saved-projects.endpoints';

export const getBookmarksHandler: GetBookmarksHandler = async (req, res, next) => {
  const bookmarks = await Bookmarks.find({ user: req.loggedUser.id })
    .select('user title')
    .populate({ path: 'projects', options: { limit: 3, sort: { createdAt: -1 } } });

  if (!bookmarks) return next(new NotFound());

  res.status(200).json({ message: 'success', data: bookmarks });
};
