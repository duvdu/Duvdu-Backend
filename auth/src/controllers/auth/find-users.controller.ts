import { Iuser, PaginationResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const filterUsers: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    username?: string;
    phoneNumber?: string;
    category?: string;
    priceFrom?: number;
    priceTo?: number;
    hasVerificationPadge?: boolean;
  }
> = (req, res, next) => {
  if (req.query.search) req.pagination.filter.$text = { $search: req.query.search };
  if (req.query.username) req.pagination.filter.username = req.query.username;
  if (req.query.phoneNumber) req.pagination.filter['phoneNumber.number'] = req.query.phoneNumber;
  if (req.query.category) req.pagination.filter.category = req.query.category;
  if (req.query.priceFrom) req.pagination.filter.price = { $gte: req.query.priceFrom };
  if (req.query.priceTo)
    req.pagination.filter.price = { ...req.pagination.filter.price, $lte: req.query.priceTo };
  if (req.query.hasVerificationPadge !== undefined)
    req.pagination.filter.hasVerificationBadge = req.query.hasVerificationPadge;
  next();
};

export const findUsers: RequestHandler<unknown, PaginationResponse<{ data: Iuser[] }>> = async (
  req,
  res,
) => {
  const count = await Users.countDocuments(req.pagination.filter);
  const users = await Users.find(req.pagination.filter)
    .skip(req.pagination.skip)
    .limit(req.pagination.limit);

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount: count,
      totalPages: Math.ceil(count / req.pagination.limit),
    },
    data: users,
  });
};
