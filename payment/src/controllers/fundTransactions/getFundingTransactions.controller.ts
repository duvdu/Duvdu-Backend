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

  // Fund amount filtering
  if (fundAmount) {
    req.pagination.filter.fundAmount = fundAmount;
  } else if (fundAmountFrom || fundAmountTo) {
    req.pagination.filter.fundAmount = {};
    if (fundAmountFrom) req.pagination.filter.fundAmount.$gte = fundAmountFrom;
    if (fundAmountTo) req.pagination.filter.fundAmount.$lte = fundAmountTo;
  }

  // Date range filtering (using UTC to match MongoDB dates)
  if (createdAtFrom || createdAtTo) {
    const startDate = createdAtFrom ? new Date(createdAtFrom) : new Date(0);
    const endDate = createdAtTo ? new Date(createdAtTo) : new Date();

    // If start and end dates are the same, filter for the entire day
    if (
      createdAtFrom &&
      createdAtTo &&
      new Date(createdAtFrom).toDateString() === new Date(createdAtTo).toDateString()
    ) {
      const dayStart = new Date(startDate);
      dayStart.setUTCHours(0, 0, 0, 0);

      const dayEnd = new Date(startDate);
      dayEnd.setUTCHours(23, 59, 59, 999);

      req.pagination.filter.completedAt = {
        $gte: dayStart,
        $lte: dayEnd,
      };
    } else {
      // For different dates or single date filters
      const filterStartDate = new Date(startDate);
      const filterEndDate = new Date(endDate);
      
      // Set start date to beginning of day (UTC)
      if (createdAtFrom) {
        filterStartDate.setUTCHours(0, 0, 0, 0);
      }
      
      // Include the entire end date by setting time to end of day (UTC)
      if (createdAtTo) {
        filterEndDate.setUTCHours(23, 59, 59, 999);
      }

      req.pagination.filter.completedAt = {
        $gte: filterStartDate,
        $lte: filterEndDate,
      };
    }
  }
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
    { $sort: { completedAt: -1 } },
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
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    {
      $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true },
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
      $unwind: { path: '$withdrawMethod', preserveNullAndEmptyArrays: true },
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
              _id: '$user._id',
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
            if: {
              $or: [
                { $eq: ['$createdBy', null] },
                { $eq: [{ $type: '$createdBy' }, 'missing'] },
                { $eq: [{ $objectToArray: '$createdBy' }, []] },
              ],
            },
            then: null,
            else: {
              _id: '$createdBy._id',
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
        fundAttachment: { $concat: [process.env.BUCKET_HOST, '/', '$fundAttachment'] },
        withdrawMethod: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$withdrawMethod', null] },
                { $eq: [{ $type: '$withdrawMethod' }, 'missing'] },
                { $eq: [{ $objectToArray: '$withdrawMethod' }, []] },
              ],
            },
            then: null,
            else: {
              _id: '$withdrawMethod._id',
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
        ticketNumber: { $ifNull: ['$ticketNumber', null] },
        status: 1,
        completedAt: 1,
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
