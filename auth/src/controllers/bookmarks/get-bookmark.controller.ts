import { Bookmarks, NotFound } from '@duvdu-v1/duvdu';

import { GetBookmarkHandler } from '../../types/endpoints/saved-projects.endpoints';

export const getBookmarkHandler: GetBookmarkHandler = async (req, res, next) => {
  const count =
    (await Bookmarks.findById(req.params.bookmarkId, { projects: 1 }))?.projects.length || 0;

  const bookmark = await Bookmarks.findById(req.params.bookmarkId, { title: 1, projects: 1 })
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
      options: { skip: req.pagination.skip, limit: req.pagination.limit, sort: { createdAt: -1 } },
    })
    .lean();
  if (!bookmark) return next(new NotFound());

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
    el.project.creatives = (el.project.creatives as { creative: { profileImage?: string } }[])?.map(
      (el) => ({
        ...el,
        creative: {
          ...el.creative,
          profileImage: el.creative.profileImage
            ? process.env.BUCKET_HOST + '/' + el.creative.profileImage
            : null,
        },
      }),
    );

    el.project.tags = (el.project.tags as { _id: string; en: string; ar: string }[])?.map((el) =>
      req.lang === 'en' ? el.en : el.ar,
    );
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
  (bookmark as any).totalProjects = bookmark.projects.length;
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
