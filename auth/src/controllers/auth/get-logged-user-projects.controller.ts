import { MODELS, NotFound, Project, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getLoggedUserProjects: RequestHandler<
  unknown,
  SuccessResponse<{ data: any }>
> = async (req, res) => {
  const count = await Project.countDocuments({
    user: req.loggedUser.id,
    ref: { $in: [MODELS.portfolioPost, 'rentals'] },
  });

  const projects = await Project.find({
    user: req.loggedUser.id,
    ref: { $in: [MODELS.portfolioPost, 'rentals'] },
  })
    .populate({
      path: 'project.type',
      select: 'cover title name creatives cycle isDeleted createdAt',
      populate: [
        { path: 'user', select: 'name username profileImage isOnline' },
        {
          path: 'creatives',
          select: 'name username profileImage isOnline',
          options: { strictPopulate: false },
        },
        { path: 'category', select: 'cycle title image' },
      ],
      options: { sort: { createdAt: -1 } },
    })
    .lean();

  const filteredProjects = projects.filter((el: any) => {
    return !el.project?.isDeleted;
  });

  filteredProjects.forEach((el: any) => {
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
      el.project.creatives = (el.project.creatives as { profileImage?: string }[])?.map((el) => ({
        ...el,
        profileImage: el.profileImage ? process.env.BUCKET_HOST + '/' + el.profileImage : null,
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

  filteredProjects.sort((a: any, b: any) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  res.status(200).json({ message: 'success', data: { total: count, projects: filteredProjects } });
};

export const getUserProjectsByUsername: RequestHandler<
  { username: string },
  SuccessResponse<{ data: any }>
> = async (req, res, next) => {
  const targetUser = await Users.findOne({ username: req.params.username }, { _id: 1 });
  if (!targetUser) return next(new NotFound());

  const count = await Project.countDocuments({
    user: targetUser.id,
    ref: { $in: [MODELS.portfolioPost, 'rentals'] },
  });

  const projects = await Project.find({
    user: targetUser.id,
    ref: { $in: [MODELS.portfolioPost, 'rentals'] },
  })
    .populate({
      path: 'project.type',
      select: 'cover title name creatives cycle audioCover',
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

  const filteredProjects = projects.filter((el: any) => {
    return !el.project?.isDeleted;
  });

  filteredProjects.forEach((el: any) => {
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
    if (el.project.audioCover)
      el.project.audioCover = process.env.BUCKET_HOST + '/' + el.project.audioCover;
    if (
      el.project?.user?.profileImage &&
      !(el.project?.user?.profileImage as string).startsWith('http')
    )
      el.project.user.profileImage = process.env.BUCKET_HOST + '/' + el.project.user.profileImage;
    if (el.project.faceRecognition)
      el.project.faceRecognition = process.env.BUCKET_HOST + '/' + el.project.faceRecognition;
    if (el.project.creatives)
      el.project.creatives = (el.project.creatives as { profileImage?: string }[])?.map((el) => ({
        ...el,
        profileImage: el.profileImage ? process.env.BUCKET_HOST + '/' + el.profileImage : null,
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

  filteredProjects.sort((a: any, b: any) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  res.status(200).json({ message: 'success', data: { total: count, projects: filteredProjects } });
};


