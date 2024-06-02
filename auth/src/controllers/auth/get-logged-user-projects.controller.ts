import { Project, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getLoggedUserProjects: RequestHandler<
  unknown,
  SuccessResponse<{ data: any }>
> = async (req, res, next) => {
  const count = await Project.countDocuments({ user: req.loggedUser.id });

  const projects = await Project.find({ user: req.loggedUser.id })
    .populate({
      path: 'project.type',
      select: 'cover title name creatives cycle',
      populate: [
        { path: 'user', select: 'name username profileImage isOnline' },
        {
          path: 'creatives.creative',
          select: 'name username profileImage isOnline',
          options: { strictPopulate: false },
        },
        { path: 'category', select: 'cycle title image' },
      ],
      options: { sort: { createdAt: -1 } },
    })
    .lean();

  projects.forEach((el: any) => {
    if (!el.project?.type) return;
    el.project = el.project.type;
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
    delete el.project.type;
  });

  res.status(200).json({ message: 'success', data: { total: count, projects } });
};
