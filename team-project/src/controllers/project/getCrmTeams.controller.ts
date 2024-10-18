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

  const transformedProjects: ITeamProject[] = [];

  for (const project of projects) {
    const projectObject = project.toObject();

    // Update URLs with BUCKET_HOST for profileImage, cover, and attachments
    if (
      projectObject.user &&
      (projectObject.user as any).profileImage &&
      !(projectObject.user as any).profileImage.startsWith(process.env.BUCKET_HOST)
    ) {
      (projectObject.user as any).profileImage =
        `${process.env.BUCKET_HOST}/${(projectObject.user as any).profileImage}`;
    }
    if (projectObject.cover) {
      projectObject.cover = `${process.env.BUCKET_HOST}/${projectObject.cover}`;
    }

    for (const [index, creative] of projectObject.creatives.entries()) {
      if (creative.category && (creative.category as any).title) {
        (creative.category as Icategory).title = (creative.category as any).title[req.lang];
      }

      for (const user of creative.users) {
        if (
          user.user &&
          (user.user as any).profileImage &&
          !(user.user as any).profileImage.startsWith(process.env.BUCKET_HOST)
        ) {
          (user.user as any).profileImage =
            `${process.env.BUCKET_HOST}/${(user.user as any).profileImage}`;
        }
        user.attachments = user.attachments.map(
          (attachment: string) => `${process.env.BUCKET_HOST}/${attachment}`,
        );
      }
    }

    transformedProjects.push(projectObject as ITeamProject);
  }

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: transformedProjects,
  });
};
