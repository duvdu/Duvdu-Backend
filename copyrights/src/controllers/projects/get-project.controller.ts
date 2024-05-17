import {  SuccessResponse, CopyRights, IcopyRights, NotFound } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: IcopyRights }>
> = async (req, res , next) => {
  const project = await CopyRights.findOne({
    _id: req.params.projectId,
    isDeleted: { $ne: true },
  }).populate([{ path: 'user', select: ['username', 'profileImage', 'isOnline' , 'acceptedProjectsCounter' , 'name' , 'rate'] }]).lean();
  if (!project) return next(new NotFound('project not found'));
  const localizedTags = project.tags.map(tag => tag[req.lang]) as string[]; 
  const localizedSubCategory = project.subCategory[req.lang]; 

  (project.tags as any) = localizedTags;
  (project.subCategory as any) = localizedSubCategory;
  (project.user as any).profileImage = `${process.env.BUCKET_HOST}/${(project.user as any).profileImage}`;
  
  res.status(200).json(<any>{ message: 'success', data: project });
};
