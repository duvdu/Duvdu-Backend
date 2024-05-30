import { Bookmarks, NotFound } from '@duvdu-v1/duvdu';

import { GetBookmarksHandler } from '../../types/endpoints/saved-projects.endpoints';

export const getBookmarksHandler: GetBookmarksHandler = async (req, res, next) => {
  const bookmarks = await Bookmarks.find({ user: req.loggedUser.id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'projects',
      populate: {
        path: 'project.type',
        populate: [
          { path: 'user', select: 'name username profileImage isOnline' },
          {
            path: 'creatives.creative',
            select: 'name username profileImage isOnline',
            options: { strictPopulate: false },
          },
          { path: 'category', select: 'cycle title image' },
        ],
      },
      options: { limit: 3, sort: { createdAt: -1 } },
    })
    .lean();

  if (!bookmarks) return next(new NotFound());
  for (const bookmark of bookmarks) {
    (bookmark as any).totalProjects = (await Bookmarks.findById(bookmark._id))?.projects.length;
    bookmark.projects.forEach((el: any) => {
      if (!el.project?.type) return;
      el.project = el.project.type;
      el.project.attachments = el.project.attachments?.map(
        (subEl: string) => process.env.BUCKET_HOST + '/' + subEl,
      );
      el.project.cover = process.env.BUCKET_HOST + '/' + el.project.cover;
      el.project.user.profileImage = el.project.user.profileImage
        ? process.env.BUCKET_HOST + '/' + el.project.user.profileImage
        : null;
      el.project.creatives = (
        el.project.creatives as { creative: { profileImage?: string } }[]
      )?.map((el) => ({
        ...el,
        creative: {
          ...el.creative,
          profileImage: el.creative.profileImage
            ? process.env.BUCKET_HOST + '/' + el.creative.profileImage
            : null,
        },
      }));

      if (el.project.tags)
        el.project.tags = (el.project.tags as { _id: string; en: string; ar: string }[])?.map(
          (el) => (req.lang === 'en' ? el.en : el.ar),
        );

      if (el.project.subCategory)
        el.project.subCategory =
          req.lang === 'en' ? el.project.subCategory.en : el.project.subCategory.ar;

      el.project.category = {
        ...el.project.category,
        title: req.lang === 'en' ? el.project.category?.title.en : el.project.category?.title.ar,
        image: el.project.category?.image
          ? process.env.BUCKET_HOST + '/' + el.project.category.image
          : null,
      };

      delete el.project.type;
    });
  }

  res.status(200).json({ message: 'success', data: bookmarks });
};
