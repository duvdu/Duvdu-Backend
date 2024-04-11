import { RequestHandler } from 'express';

export const globalPaginationMiddleware: RequestHandler = async (req, res, next) => {
  const limit = +(req.query.limit || 10);
  const page = +(req.query.page || 1);
  const skip = limit * (page - 1);
  req.pagination = {
    limit,
    page,
    skip,
    filter: {},
  };
  next();
};
