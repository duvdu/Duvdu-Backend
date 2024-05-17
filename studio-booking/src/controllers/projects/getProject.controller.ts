import 'express-async-errors';

import { NotFound, studioBooking } from '@duvdu-v1/duvdu';

import { GetProjectHandler } from '../../types/endpoints/endpoints';

export const getProjectHandler: GetProjectHandler = async (req, res, next) => {
  const project = await studioBooking
    .findOne({
      _id: req.params.projectId,
      isDeleted: { $ne: true },
    }).populate([
      {path:'user' , select:'isOnline profileImage username'},
      {path:'creatives.creative' , select:'isOnline profileImage username'}
    ]);

  if (!project) return next(new NotFound('project not found'));

  ((project as any)._doc.subCategory as any) = project.subCategory[req.lang];

  ((project as any)._doc.tags as any) = project.tags.map(tag => tag[req.lang]);

  res.status(200).json({ message: 'success', data: project });
};
