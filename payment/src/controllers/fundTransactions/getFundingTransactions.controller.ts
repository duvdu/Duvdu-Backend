import {
  FundedTransaction,
  FundedTransactionStatus,
  IFundedTransaction,
  PaginationResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

export const getFundingTransactionPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    user?: string;
    status?: FundedTransactionStatus;
    createdBy?: string;
    fundAmountFrom?: number;
    fundAmountTo?: number;
    fundAmount?: number;
    createdAtFrom?: string;
    createdAtTo?: string;
  }
> = async (req, res, next) => {
  const {
    user,
    status,
    createdBy,
    fundAmountFrom,
    fundAmountTo,
    fundAmount,
    createdAtFrom,
    createdAtTo,
  } = req.query;

  req.pagination.filter = {};
  if (user) req.pagination.filter.user = new Types.ObjectId(user);
  if (status) req.pagination.filter.status = status;
  if (createdBy) req.pagination.filter.createdBy = new Types.ObjectId(createdBy);

  if (fundAmountFrom) req.pagination.filter.fundAmount = { $gte: fundAmountFrom };
  if (fundAmountTo) req.pagination.filter.fundAmount = { $lte: fundAmountTo };
  if (fundAmount) req.pagination.filter.fundAmount = fundAmount;

  if (createdAtFrom) req.pagination.filter.createdAt = { $gte: createdAtFrom };
  if (createdAtTo) req.pagination.filter.createdAt = { $lte: createdAtTo };

  next();
};

export const getFundingTransactions: RequestHandler<
  unknown,
  PaginationResponse<{ data: IFundedTransaction[] }>
> = async (req, res) => {
  const transactions = await FundedTransaction.find()
    .sort({ createdAt: -1 })
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .populate([
      { path: 'user', select: 'name username email profileImage phoneNumber' },
      { path: 'createdBy', select: 'name username email profileImage phoneNumber' },
    ]);

  const resultCount = await FundedTransaction.countDocuments();

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: transactions,
  });
};
