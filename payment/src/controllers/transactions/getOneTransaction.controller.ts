import { ITransaction, MODELS, NotFound, SuccessResponse, Transaction } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

export const getOneTransaction: RequestHandler<
  { transactionId: string },
  SuccessResponse<{ data: ITransaction }>
> = async (req, res) => {
  const transactions = await Transaction.aggregate([
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

  if (transactions.length === 0)
    throw new NotFound({ ar: 'المعاملة غير موجودة', en: 'Transaction not found' }, req.lang);

  res.status(200).json({
    message: 'success',
    data: transactions[0],
  });
};
