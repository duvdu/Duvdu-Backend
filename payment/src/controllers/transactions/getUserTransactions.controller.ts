import {
  ITransaction,
  PaginationResponse,
  Transaction,
  TransactionStatus,
  TransactionType,
  MODELS,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

export const userTransactionPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
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

  req.pagination.filter.user = new Types.ObjectId(req.loggedUser.id);

  if (req.query.status) req.pagination.filter.status = req.query.status;

  if (req.query.type) req.pagination.filter.type = req.query.type;

  if (req.query.model) req.pagination.filter.model = req.query.model;

  if (req.query.isSubscription !== undefined)
    req.pagination.filter.isSubscription = req.query.isSubscription;

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

export const getUserTransactions: RequestHandler<
  unknown,
  PaginationResponse<{ data: ITransaction[] }>
> = async (req, res) => {
  const transactions = await Transaction.aggregate([
    { $match: req.pagination.filter },
    { $sort: { createdAt: -1 } },
    { $skip: req.pagination.skip },
    { $limit: req.pagination.limit },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'fundedBy',
        foreignField: '_id',
        as: 'fundedBy',
      },
    },
    {
      $unwind: { path: '$fundedBy', preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        user: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$user', null] },
                { $eq: [{ $type: '$user' }, 'missing'] },
                { $eq: [{ $objectToArray: '$user' }, []] },
              ],
            },
            then: null,
            else: {
              name: '$user.name',
              username: '$user.username',
              email: '$user.email',
              profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$user.profileImage'] },
              phoneNumber: '$user.phoneNumber',
            },
          },
        },
        fundedBy: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$fundedBy', null] },
                { $eq: [{ $type: '$fundedBy' }, 'missing'] },
                { $eq: [{ $objectToArray: '$fundedBy' }, []] },
              ],
            },
            then: null,
            else: {
              name: '$fundedBy.name',
              username: '$fundedBy.username',
              email: '$fundedBy.email',
              profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$fundedBy.profileImage'] },
              phoneNumber: '$fundedBy.phoneNumber',
            },
          },
        },
        createdAt: 1,
        amount: 1,
        status: 1,
        type: 1,
        model: 1,
        isSubscription: 1,
        ticketNumber: { $ifNull: ['$ticketNumber', null] },
        currency: 1,
        fundingAmount: 1,
        fundedAt: 1,
        fundAttachment: {
          $map: {
            input: '$fundAttachment',
            as: 'fundAttachment',
            in: { $concat: [process.env.BUCKET_HOST, '/', '$$fundAttachment'] },
          },
        },
        contract: 1,
      },
    },
  ]);

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
