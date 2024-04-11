import { RequestHandler } from 'express';

import { Iproject, Projects } from '../../models/project';
import { PaginationResponse } from '../../types/pagination-response';

export const getCrmProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: Iproject[] }>
> = async (req, res) => {
  const resultCount = await Projects.countDocuments(req.pagination.filter);
  const projects = await Projects.find(req.pagination.filter)
    .sort('-createdAt')
    .limit(req.pagination.limit)
    .skip(req.pagination.skip);

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
