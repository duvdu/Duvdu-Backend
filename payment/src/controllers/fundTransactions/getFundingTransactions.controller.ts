import {
  FundedTransaction,
  FundedTransactionStatus,
  IFundedTransaction,
  MODELS,
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
    contract?: string;
    ticketNumber?: string;
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
    contract,
    ticketNumber,
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
  if (contract) req.pagination.filter.contract = new Types.ObjectId(contract);
  if (ticketNumber) req.pagination.filter.ticketNumber = ticketNumber;

  next();
};

export const getFundingTransactions: RequestHandler<
  unknown,
  PaginationResponse<{ data: IFundedTransaction[] }>
> = async (req, res) => {
  const transactions = await FundedTransaction.aggregate([
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
      $unwind: '$user',
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    {
      $unwind: '$createdBy',
    },
    {
      $lookup: {
        from: MODELS.withdrawMethod,
        localField: 'withdrawMethod',
        foreignField: '_id',
        as: 'withdrawMethod',
      },
    },
    {
      $unwind: '$withdrawMethod',
    },
    {
      $project: {
        user: {
          $cond: {
            if: { $eq: ['$user', null] },
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
        createdBy: {
          $cond: {
            if: { $eq: ['$createdBy', null] },
            then: null,
            else: {
              name: '$createdBy.name',
              username: '$createdBy.username',
              email: '$createdBy.email',
              profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$createdBy.profileImage'] },
              phoneNumber: '$createdBy.phoneNumber',
            },
          },
        },
        createdAt: 1,
        fundAmount: 1,
        fundAttachment: {
          $map: {
            input: '$fundAttachment',
            as: 'fundAttachment',
            in: { $concat: [process.env.BUCKET_HOST, '/', '$$fundAttachment'] },
          },
        },
        withdrawMethod: {
          $cond: {
            if: { $eq: ['$withdrawMethod', null] },
            then: null,
            else: {
              method: '$withdrawMethod.method',
              number: '$withdrawMethod.number',
              name: '$withdrawMethod.name',
              status: '$withdrawMethod.status',
              default: '$withdrawMethod.default',
              isDeleted: '$withdrawMethod.isDeleted',
            },
          },
        },
        contract: 1,
        ticketNumber: {
          $cond: {
            if: { $eq: ['$ticketNumber', null] },
            then: null,
            else: '$ticketNumber',
          },
        },
        status: 1,
      },
    },
  ]);

  const resultCount = await FundedTransaction.countDocuments(req.pagination.filter);

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
