import { NotFound, SuccessResponse, IportfolioPost, PortfolioPosts, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: IportfolioPost }>
> = async (req, res, next) => {
  const project = await PortfolioPosts.findOne({
    _id: req.params.projectId,
    isDeleted: { $ne: true },
  }).lean();
  if (!project) return next(new NotFound('project not found'));
  (project.user as any) = await Users.findById(project.user, 'username profileImage isOnline acceptedProjectsCounter name').lean();

  for (let i = 0; i < project.creatives.length; i++) {
    const creativeId = project.creatives[i].creative;
    (project.creatives[i].creative as any) = await Users.findById(creativeId, 'username profileImage isOnline acceptedProjectsCounter name').lean();
  }

  (project.subCategory as any) = project.subCategory[req.lang];

  (project.tags as any) = project.tags.map(tag => tag[req.lang]);


  
  res.status(200).json(<any>{ message: 'success', data: project });
};
