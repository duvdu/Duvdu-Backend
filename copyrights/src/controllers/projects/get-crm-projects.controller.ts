import { PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { CopyRights, IcopyRights } from '../../models/copyrights.model';

export const getCrmProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IcopyRights[] }>
> = async (req, res) => {
  const resultCount = await CopyRights.countDocuments(req.pagination.filter);
  const projects = await CopyRights.find(req.pagination.filter)
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
