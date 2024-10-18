/* eslint-disable @typescript-eslint/no-unused-vars */
import 'express-async-errors';

import { Icategory, ITeamProject, TeamContract, TeamProject } from '@duvdu-v1/duvdu';
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
    creative?: string;
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
    req.pagination.filter['creatives.category'] = new mongoose.Types.ObjectId(req.query.category);

  if (req.query.maxBudget !== undefined)
    req.pagination.filter['creatives.users.totalAmount'] = { $lte: req.query.maxBudget };

  if (req.query.minBudget !== undefined)
    req.pagination.filter['creatives.users.totalAmount'] = { $gte: req.query.minBudget };

  if (req.query.isDeleted) req.pagination.filter.isDeleted = req.query.isDeleted;

  if (req.query.creative)
    req.pagination.filter['creatives.users.user'] = new mongoose.Types.ObjectId(req.query.creative);

  next();
};

export const getProjectsHandler: GetProjectsHandler = async (req, res) => {
  const projects = await TeamProject.find({
    ...req.pagination.filter,
    user: req.loggedUser.id,
    isDeleted: { $ne: true },
  })
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

  const resultCount = await TeamProject.countDocuments({
    ...req.pagination.filter,
    user: req.loggedUser.id,
    isDeleted: { $ne: true },
  });

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
