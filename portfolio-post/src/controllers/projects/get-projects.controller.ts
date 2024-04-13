import { IportfolioPost, PaginationResponse, PortfolioPosts } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    address?: string;
    tools?: string[];
    tags?: string[];
    projectBudgetFrom?: number;
    projectBudgetTo?: number;
    category?: string;
    creative?: string;
    isDeleted?: boolean;
    startDate?: Date;
    endDate?: Date;
  }
> = (req, res, next) => {
  if (req.query.search) req.pagination.filter.$text = { $search: req.query.search };
  if (req.query.address)
    req.pagination.filter.address = { $regex: req.query.address, $options: 'i' };
  if (req.query.tools) req.pagination.filter.tools = { $elemMatch: { name: req.query.tools } };
  if (req.query.tags) req.pagination.filter.tags = { $in: req.query.tags };
  if (req.query.projectBudgetFrom)
    req.pagination.filter.projectBudget = { $gte: req.query.projectBudgetFrom };
  if (req.query.projectBudgetTo)
    req.pagination.filter.projectBudget = {
      ...req.pagination.filter.projectBudget,
      $lte: req.query.projectBudgetTo,
    };
  if (req.query.creative) {
    req.pagination.filter.$or = [
      { user: req.query.creative },
      { creatives: { $elemMatch: { creative: req.query.creative } } },
    ];
  }
  if (req.query.category) req.pagination.filter.category = req.query.category;
  if (req.query.startDate || req.query.endDate)
    req.pagination.filter.createdAt = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  if (req.query.isDeleted !== undefined) {
    req.pagination.filter.isDeleted = req.query.isDeleted ? true : { $ne: true };
  }
  next();
};

export const getProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IportfolioPost[] }>
> = async (req, res) => {
  const resultCount = await PortfolioPosts.countDocuments({
    ...req.pagination.filter,
    isDeleted: { $ne: true },
  });
  const projects = await PortfolioPosts.find({ ...req.pagination.filter, isDeleted: { $ne: true } })
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
