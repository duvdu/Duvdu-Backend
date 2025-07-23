import {
  ITransaction,
  PaginationResponse,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

export const transactionPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    user?: string;
    contract?: string;
    status?: TransactionStatus;
    type?: TransactionType;
    model?: string;
    isSubscription?: boolean;
    amountFrom?: number;
    amountTo?: number;
    amount?: number;
    from?: string;
    to?: string;
  }
> = async (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.user) req.pagination.filter.user = new Types.ObjectId(req.query.user);

  if (req.query.contract) req.pagination.filter.contract = new Types.ObjectId(req.query.contract);

  if (req.query.status) req.pagination.filter.status = req.query.status;

  if (req.query.type) req.pagination.filter.type = req.query.type;

  if (req.query.model) req.pagination.filter.model = req.query.model;

  if (req.query.isSubscription !== undefined) req.pagination.filter.isSubscription = req.query.isSubscription;

  // Handle amount range properly
  if (req.query.amountFrom || req.query.amountTo) {
    req.pagination.filter.amount = {};
    if (req.query.amountFrom) req.pagination.filter.amount.$gte = req.query.amountFrom;
    if (req.query.amountTo) req.pagination.filter.amount.$lte = req.query.amountTo;
  } else if (req.query.amount) {
    req.pagination.filter.amount = req.query.amount;
  }

  // Handle date range properly
  if (req.query.from || req.query.to) {
    req.pagination.filter.createdAt = {};
    if (req.query.from) req.pagination.filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) req.pagination.filter.createdAt.$lte = new Date(req.query.to);
  }
  next();
};

export const getAllTransactions: RequestHandler<
  unknown,
  PaginationResponse<{ data: ITransaction[] }>
> = async (req, res) => {
  const transactions = await Transaction.find(req.pagination.filter)
    .populate([
      { path: 'user', select: 'name email phoneNumber profileImage' },
      { path: 'fundedBy', select: 'name email phoneNumber profileImage' },
    ])
    .sort({ createdAt: -1 })
    .skip(req.pagination.skip)
    .limit(req.pagination.limit);

  const resultCount = await Transaction.countDocuments(req.pagination.filter);

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
