import { SuccessResponse, CopyRights, IcopyRights, NotFound, Icategory } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: IcopyRights }>
> = async (req, res, next) => {
  const project = await CopyRights.findOne({
    _id: req.params.projectId,
    isDeleted: { $ne: true },
  })
    .populate([
      {
        path: 'user',
        select: [
          'username',
          'profileImage',
          'isOnline',
          'acceptedProjectsCounter',
          'name',
          'rate',
          'rank',
          'projectsView',
        ],
      },
      {
        path: 'category',
        select: ['_id', 'title'],
      },
    ])
    .lean();
  if (!project)
    return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));
  const localizedTags = project.tags.map((tag) => tag[req.lang]) as string[];
  const localizedSubCategory = {
    title: project.subCategory[req.lang],
    _id: project.subCategory._id,
  };

  (project.tags as any) = localizedTags;
  (project.subCategory as any) = localizedSubCategory;
  (project.user as any).profileImage =
    `${process.env.BUCKET_HOST}/${(project.user as any).profileImage}`;

  (project.category as any) =
    req.lang === 'en'
      ? (project.category as Icategory).title?.en
      : (project.category as Icategory).title?.ar;

  project.location = {
    lng: project.location?.coordinates?.[0],
    lat: project.location?.coordinates?.[1],
  };

  res.status(200).json(<any>{ message: 'success', data: project });
};
