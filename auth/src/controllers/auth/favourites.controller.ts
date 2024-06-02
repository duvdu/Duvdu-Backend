/* eslint-disable indent */
import { NotFound, PaginationResponse, Project, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateFavouriteList: RequestHandler<
  { projectId: string },
  SuccessResponse,
  unknown,
  { action?: 'add' | 'remove' }
> = async (req, res, next) => {
  let project;
  if (req.query.action !== 'remove') {
    project = await Project.findOne({ 'project.type': req.params.projectId });
    if (!project)
      return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));
  }

  const filter =
    req.query.action === 'remove'
      ? { $pull: { favourites: { project: req.params.projectId } } , likes:{$inc:-1} }
      : {
          $addToSet: { favourites: { project: req.params.projectId, cycle: (project as any).ref } },
          likes:{$inc:1}
        };
  await Users.updateOne({ _id: req.loggedUser.id }, filter);

  res.status(200).json({ message: 'success' });
};

export const getFavouriteProjects: RequestHandler<
  unknown,
  PaginationResponse<{ data: any }>
> = async (req, res) => {
  const count =
    (await Users.findById(req.loggedUser.id, { favourites: 1 }))?.favourites.length || 0;

  const user = await Users.findById(req.loggedUser.id, { favourites: 1 })
    .populate({
      path: 'favourites.project',
      options: { limit: req.pagination.limit, skip: req.pagination.skip },
      populate: [
        { path: 'user', select: 'name username profileImage isOnline' },
        {
          path: 'creatives.creative',
          select: 'name username profileImage isOnline',
          options: { strictPopulate: false },
        },
        { path: 'category', select: 'cycle title image' },
      ],
    })
    .lean();

  user?.favourites.forEach((el: any) => {
    el.project.tags = (el.project.tags as { _id: string; en: string; ar: string }[])?.map((el) =>
      req.lang === 'en' ? el.en : el.ar,
    );
    if (el.project.attachments)
      el.project.attachments = el.project.attachments?.map(
        (subEl: string) => process.env.BUCKET_HOST + '/' + subEl,
      );
    if (el.project.cover) el.project.cover = process.env.BUCKET_HOST + '/' + el.project.cover;
    if (
      el.project?.user?.profileImage &&
      !(el.project?.user?.profileImage as string).startsWith('http')
    )
      el.project.user.profileImage = process.env.BUCKET_HOST + '/' + el.project.user.profileImage;
    if (el.project.creatives)
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
      el.project.tags = (el.project.tags as { _id: string; en: string; ar: string }[])?.map((el) =>
        req.lang === 'en' ? el.en : el.ar,
      );
    if (el.project.subCategory)
      el.project.subCategory =
        req.lang === 'en' ? el.project.subCategory.en : el.project.subCategory.ar;

    if (el.project.category)
      el.project.category = {
        ...el.project.category,
        title: req.lang === 'en' ? el.project.category?.title.en : el.project.category?.title.ar,
        image: el.project.category?.image
          ? process.env.BUCKET_HOST + '/' + el.project.category.image
          : null,
      };
  });

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      totalPages: Math.ceil(count / req.pagination.limit),
      resultCount: count,
    },
    data: user?.favourites,
  });
};
