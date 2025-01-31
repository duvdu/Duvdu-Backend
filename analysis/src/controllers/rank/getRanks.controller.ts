import 'express-async-errors';

import { Irank, PaginationResponse, Rank } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getRanksPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    actionCountFrom?: number;
    actionCountTo?: number;
    projectsCountFrom?: number;
    projectsCountTo?: number;
    projectsLikedFrom?: number;
    projectsLikedTo?: number;
    rank?: string;
    startDate?: Date;
    endDate?: Date;
  }
> = (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.actionCountFrom || req.query.actionCountTo) {
    req.pagination.filter.actionCount = {};
    if (req.query.actionCountFrom) {
      req.pagination.filter.actionCount.$gte = req.query.actionCountFrom;
    }
    if (req.query.actionCountTo) {
      req.pagination.filter.actionCount.$lte = req.query.actionCountTo;
    }
  }

  if (req.query.projectsCountFrom || req.query.projectsCountTo) {
    req.pagination.filter.projectsCount = {};
    if (req.query.projectsCountFrom) {
      req.pagination.filter.projectsCount.$gte = req.query.projectsCountFrom;
    }
    if (req.query.projectsCountTo) {
      req.pagination.filter.projectsCount.$lte = req.query.projectsCountTo;
    }
  }

  if (req.query.projectsLikedFrom || req.query.projectsLikedTo) {
    req.pagination.filter.projectsLiked = {};
    if (req.query.projectsLikedFrom) {
      req.pagination.filter.projectsLiked.$gte = req.query.projectsLikedFrom;
    }
    if (req.query.projectsLikedTo) {
      req.pagination.filter.projectsLiked.$lte = req.query.projectsLikedTo;
    }
  }

  if (req.query.rank) {
    req.pagination.filter.rank = req.query.rank;
  }

  if (req.query.startDate || req.query.endDate) {
    req.pagination.filter.createdAt = {};
    if (req.query.startDate) {
      req.pagination.filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      req.pagination.filter.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  next();
};

export const getRanksHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: Irank[] }>,
  unknown,
  unknown
> = async (req, res) => {
  const ranks = await Rank.find(req.pagination.filter)
    .skip(req.pagination.skip)
    .limit(req.pagination.limit);

  const resultCount = await Rank.countDocuments(req.pagination.filter);

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: ranks,
  });
};
