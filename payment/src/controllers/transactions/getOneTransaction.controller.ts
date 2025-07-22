import { ITransaction, NotFound, SuccessResponse, Transaction } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getOneTransaction: RequestHandler<
  { transactionId: string },
  SuccessResponse<{ data: ITransaction }>
> = async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId).populate([
    { path: 'user', select: 'name email phoneNumber profileImage' },
    { path: 'fundedBy', select: 'name email phoneNumber profileImage' },
  ]);
  if (!transaction)
    throw new NotFound({ ar: 'المعاملة غير موجودة', en: 'Transaction not found' }, req.lang);

  res.status(200).json({
    message: 'success',
    data: transaction,
  });
};
