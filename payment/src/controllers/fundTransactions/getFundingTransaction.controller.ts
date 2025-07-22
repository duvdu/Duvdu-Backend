import { FundedTransaction, IFundedTransaction, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getFundingTransaction: RequestHandler<
  { transactionId: string },
  SuccessResponse<{ data: IFundedTransaction }>
> = async (req, res) => {
  const transaction = await FundedTransaction.findById(req.params.transactionId).populate([
    { path: 'user', select: 'name username email profileImage phoneNumber' },
    { path: 'createdBy', select: 'name username email profileImage phoneNumber' },
  ]);

  if (!transaction)
    throw new NotFound({ ar: 'المعاملة غير موجودة', en: 'Transaction not found' }, req.lang);

  res.status(200).json({
    message: 'success',
    data: transaction,
  });
};
