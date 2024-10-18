import 'express-async-errors';

import { NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { GetTeamCrmHandler } from '../../types/project.endpoints';

export const getCrmTeamHandler: GetTeamCrmHandler = async (req, res, next) => {
  const project = await TeamProject.findById(req.params.teamId).populate([
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
