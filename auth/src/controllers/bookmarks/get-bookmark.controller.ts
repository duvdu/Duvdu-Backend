import { Bookmarks, NotFound } from '@duvdu-v1/duvdu';

import { GetBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const getBookmarkHandler: GetBookmarkHandler = async (req, res, next) => {
  const count =
    (await Bookmarks.findById(req.params.bookmarkId, { projects: 1 }))?.projects.length || 0;

  const bookmark = await Bookmarks.findById(req.params.bookmarkId, { title: 1, projects: 1 })
    .populate({
      path: 'projects',
      populate: { path: 'project.type' },
      options: { limit: req.pagination.limit, skip: req.pagination.skip },
    })
    .lean();
  if (!bookmark) return next(new NotFound());

  bookmark.projects.forEach((el: any) => {
    el.project = el.project.type;
    delete el.project.type;
  });
  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount: count,
      totalPages: Math.ceil(count / req.pagination.limit),
    },
    data: bookmark,
  });
};
