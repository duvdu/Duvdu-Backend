import { Bookmarks, NotFound } from '@duvdu-v1/duvdu';

import { GetBookmarksHandler } from '../../types/endpoints/saved-projects.endpoints';

export const getBookmarksHandler: GetBookmarksHandler = async (req, res, next) => {
  const bookmarks = await Bookmarks.find({ user: req.loggedUser.id }, { user: 1, title: 1 })
    .sort({ createdAt: -1 })
    .populate({
      path: 'projects',
      populate: {
        path: 'project.type',
        populate: [
          { path: 'user', select: 'name username profileImage isOnline' },
          { path: 'creatives', select: 'name username profileImage isOnline' },
        ],
      },
      options: { limit: 3, sort: { createdAt: -1 } },
    })
    .lean();

  if (!bookmarks) return next(new NotFound());
  for (const bookmark of bookmarks) {
    (bookmark as any).totalProjects = (await Bookmarks.findById(bookmark._id))?.projects.length;
    bookmark.projects.forEach((el: any) => {
      el.project = el.project.type;
      el.project.attachments = el.project.attachments.map(
        (subEl: string) => process.env.BUCKET_HOST + '/' + subEl,
      );
      el.project.cover = process.env.BUCKET_HOST + '/' + el.project.cover;
      delete el.project.type;
    });
  }

  bookmarks.unshift(bookmarks.pop() as any);

  res.status(200).json({ message: 'success', data: bookmarks });
};
