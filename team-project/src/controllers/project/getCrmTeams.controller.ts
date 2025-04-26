/* eslint-disable @typescript-eslint/no-unused-vars */
import 'express-async-errors';

import { Icategory, ITeamProject, TeamProject } from '@duvdu-v1/duvdu';

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
      { path: 'relatedContracts.category', select: 'title' },
      {
        path: 'relatedContracts.contracts.contract',
        select: 'totalPrice',
        populate: [
          {
            path: 'customer',
            select:
              'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
          },
          {
            path: 'sp',
            select:
              'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
          },
        ],
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

    for (const contract of projectObject.relatedContracts || []) {
      if (contract.category && (contract.category as any).title) {
        (contract.category as Icategory).title = (contract.category as any).title[req.lang];
      }

      for (const contractItem of contract.contracts || []) {
        const contractData = contractItem.contract as any;
        if (
          contractData &&
          contractData.customer &&
          contractData.customer.profileImage &&
          !contractData.customer.profileImage.startsWith(process.env.BUCKET_HOST)
        ) {
          contractData.customer.profileImage = `${process.env.BUCKET_HOST}/${contractData.customer.profileImage}`;
        }
        if (
          contractData &&
          contractData.sp &&
          contractData.sp.profileImage &&
          !contractData.sp.profileImage.startsWith(process.env.BUCKET_HOST)
        ) {
          contractData.sp.profileImage = `${process.env.BUCKET_HOST}/${contractData.sp.profileImage}`;
        }
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
