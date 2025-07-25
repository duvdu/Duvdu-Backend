import { FundedTransaction, IFundedTransaction, MODELS, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

export const getFundingTransaction: RequestHandler<
  { transactionId: string },
  SuccessResponse<{ data: IFundedTransaction }>
> = async (req, res) => {
  const transactions = await FundedTransaction.aggregate([
    { $match: { _id: new Types.ObjectId(req.params.transactionId) } },
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
            if: { $or: [
              { $eq: ['$user', null] },
              { $eq: [{ $type: '$user' }, 'missing'] },
              { $eq: [{ $objectToArray: '$user' }, []] },
            ],},
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
            if: { $or: [
              { $eq: ['$createdBy', null] },
              { $eq: [{ $type: '$createdBy' }, 'missing'] },
              { $eq: [{ $objectToArray: '$createdBy' }, []] },
            ],},
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
        fundAttachment: { $concat: [process.env.BUCKET_HOST, '/', '$$fundAttachment'] },
        withdrawMethod: {
          $cond: {
            if: { $or: [
              { $eq: ['$withdrawMethod', null] },
              { $eq: [{ $type: '$withdrawMethod' }, 'missing'] },
              { $eq: [{ $objectToArray: '$withdrawMethod' }, []] },
            ],},
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
      },
    },
  ]);
  if (transactions.length === 0)
    throw new NotFound({ ar: 'المعاملة غير موجودة', en: 'Transaction not found' }, req.lang);

  res.status(200).json({
    message: 'success',
    data: transactions[0],
  });
};
