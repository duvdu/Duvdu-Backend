import { NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Iproject, Projects } from '../../models/project';

export const getProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: Iproject }>
> = async (req, res, next) => {
  const project = await Projects.findOne({
    _id: req.params.projectId,
    isDeleted: { $ne: true },
  }).populate([
    { path: 'user', select: ['username', 'profileImage', 'isOnline'] },
    { path: 'creatives.creative', select: ['username', 'profileImage', 'isOnline'] },
  ]);
  if (!project) return next(new NotFound('project not found'));

  res.status(200).json({ message: 'success', data: project });
};
