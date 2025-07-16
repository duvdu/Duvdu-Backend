import { IWithdrawMethod, PaginationResponse, WithdrawMethodModel } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';




export const getMethodsCrmPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    user?: string;
    status?: string;
    method?: string;
    isDeleted?: boolean;
  }
> = async (req, res, next) => {

  req.pagination.filter = {};

  if (req.query.user) {
    req.pagination.filter.user = new Types.ObjectId(req.query.user);
  }

  if (req.query.status) {
    req.pagination.filter.status = req.query.status;
  }

  if (req.query.method) {
    req.pagination.filter.method = req.query.method;
  }

  if (req.query.isDeleted) {
    req.pagination.filter.isDeleted = req.query.isDeleted;
  }

  next();
};

export const getMethodsCrm: RequestHandler<
  unknown,
  PaginationResponse<{ data: IWithdrawMethod[] }>,
  unknown
> = async (req, res) => {
  const methods = await WithdrawMethodModel.find(req.pagination.filter)
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .sort({ createdAt: -1 })
    .populate({
      path: 'user',
      select: 'name email phoneNumber profileImage',
    });
  const resultCount = await WithdrawMethodModel.countDocuments(req.pagination.filter);
  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: methods,
  });
};
