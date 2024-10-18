/* eslint-disable @typescript-eslint/no-unused-vars */
import 'express-async-errors';

import { Icategory, ITeamProject, TeamContract, TeamProject } from '@duvdu-v1/duvdu';

import { GetTeamsCrmHandler } from '../../types/project.endpoints';

export const getTeamsCrmHandler: GetTeamsCrmHandler = async (req, res) => {
  const projects = await TeamProject.find({ ...req.pagination.filter })
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .populate([
      {
        path: 'user',
        select:
          'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
      },
      { path: 'creatives.category', select: 'title' },
      {
        path: 'creatives.users.user',
        select:
          'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
      },
    ]);

  const resultCount = await TeamProject.countDocuments({ ...req.pagination.filter });


  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: projects,
  });
};
