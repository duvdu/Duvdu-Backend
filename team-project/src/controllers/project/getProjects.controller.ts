/* eslint-disable @typescript-eslint/no-unused-vars */
import 'express-async-errors';

import { Icategory, ITeamProject, TeamProject } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { GetProjectsHandler } from '../../types/project.endpoints';

export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    category?: string;
    maxBudget?: number;
    minBudget?: number;
    user?: string;
    contract?: string;
    isDeleted?: boolean;
  }
> = (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.search)
    req.pagination.filter.$or = {
      title: { $regex: req.query.search, $options: 'i' },
      desc: { $regex: req.query.search, $options: 'i' },
    };

  if (req.query.category)
    req.pagination.filter['relatedContracts.category'] = new mongoose.Types.ObjectId(
      req.query.category,
    );

  if (req.query.maxBudget !== undefined)
    req.pagination.filter['relatedContracts.contracts.contract.totalPrice'] = {
      $lte: req.query.maxBudget,
    };

  if (req.query.minBudget !== undefined)
    req.pagination.filter['relatedContracts.contracts.contract.totalPrice'] = {
      $gte: req.query.minBudget,
    };

  if (req.query.isDeleted) req.pagination.filter.isDeleted = req.query.isDeleted;

  if (req.query.contract)
    req.pagination.filter['relatedContracts.contracts.contract'] = new mongoose.Types.ObjectId(
      req.query.contract,
    );

  next();
};

export const getProjectsHandler: GetProjectsHandler = async (req, res) => {
  const projects = await TeamProject.find({
    ...req.pagination.filter,
    user: req.loggedUser.id,
    isDeleted: { $ne: true },
  })
    .sort({ createdAt: -1 })
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

  const resultCount = await TeamProject.countDocuments({
    ...req.pagination.filter,
    user: req.loggedUser.id,
    isDeleted: { $ne: true },
  });

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
