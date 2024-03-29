import { NotFound , Bookmarks } from '@duvdu-v1/duvdu';

import { RemoveProjectFromBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const removeProjectFromBookmarkHandler: RemoveProjectFromBookmarkHandler = async (
  req,
  res,
  next,
) => {
  const bookmark = await Bookmarks.findByIdAndUpdate(req.params.bookmarkId, {
    $pull: { projects: req.params.projectId },
  });
  if (!bookmark) return next(new NotFound());
  res.status(200).json({ message: 'success' });
};
