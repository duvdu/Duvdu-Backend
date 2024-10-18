import 'express-async-errors';

import { NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { GetProjectHandler } from '../../types/project.endpoints';

export const getProjectHandler: GetProjectHandler = async (req, res, next) => {
  const project = await TeamProject.findOne({
    _id: req.params.teamId,
    isDeleted: { $ne: true },
  }).populate([
    {
      path: 'user',
      select: 'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
    },
    { path: 'creatives.category', select: 'title' },
    {
      path: 'creatives.users.user',
      select: 'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
    },
  ]);

  if (!project) return next(new NotFound({ en: 'team not found', ar: 'التيم غير موجود' }));



  res.status(200).json({ message: 'success', data: project });
};
