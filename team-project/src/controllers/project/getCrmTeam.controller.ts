import 'express-async-errors';

import { Icategory, NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { GetTeamCrmHandler } from '../../types/project.endpoints';

export const getCrmTeamHandler: GetTeamCrmHandler = async (req, res, next) => {
  const project = await TeamProject.findById(req.params.teamId).populate([
    {
      path: 'user',
      select: 'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
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

  if (!project) return next(new NotFound({ en: 'team not found', ar: 'التيم غير موجود' }));

  const projectObject = project.toObject();

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

  res.status(200).json({ message: 'success', data: projectObject });
};
