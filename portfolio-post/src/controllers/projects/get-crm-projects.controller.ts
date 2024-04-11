import { IportfolioPost, PaginationResponse, PortfolioPosts } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getCrmProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IportfolioPost[] }>
> = async (req, res) => {
  const resultCount = await PortfolioPosts.countDocuments(req.pagination.filter);
  const projects = await PortfolioPosts.find(req.pagination.filter)
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
