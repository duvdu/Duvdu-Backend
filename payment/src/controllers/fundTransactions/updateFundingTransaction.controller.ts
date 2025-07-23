import {
  BadRequestError,
  Bucket,
  FOLDERS,
  FundedTransaction,
  FundedTransactionStatus,
  IFundedTransaction,
  NotFound,
  SuccessResponse,
  Users,
  WithdrawMethodModel,
  WithdrawMethodStatus,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

export const updateFundingTransaction: RequestHandler<
  { transactionId: string },
  SuccessResponse<{ data: IFundedTransaction }>,
  Pick<IFundedTransaction, 'withdrawMethod' | 'fundAttachment'>
> = async (req, res) => {
  const transaction = await FundedTransaction.findById(req.params.transactionId);
  if (!transaction)
    throw new NotFound({ ar: 'المعاملة غير موجودة', en: 'Transaction not found' }, req.lang);

  if (
    [FundedTransactionStatus.FAILED, FundedTransactionStatus.SUCCESS].includes(transaction.status)
  )
    throw new BadRequestError(
      { ar: 'المعاملة غير قابلة للتعديل', en: 'Transaction is not editable' },
      req.lang,
    );

  const user = await Users.findById(transaction.user);
  if (!user) throw new NotFound({ ar: 'المستخدم غير موجود', en: 'User not found' }, req.lang);

  const withdrawMethod = await WithdrawMethodModel.findOne({
    _id: req.body.withdrawMethod,
    user: user._id,
    status: WithdrawMethodStatus.ACTIVE,
  });
  if (!withdrawMethod)
    throw new NotFound({ ar: 'الطريقة غير موجودة', en: 'Withdraw method not found' }, req.lang);

  const attachment = <Express.Multer.File[] | undefined>(req.files as any).fundAttachment || [];
  if (attachment.length) {
    const s3 = new Bucket();
    await s3.saveBucketFiles(FOLDERS.transactions, ...attachment);
    req.body.fundAttachment = `${FOLDERS.transactions}/${attachment[0].filename}`;
  }

  transaction.withdrawMethod = withdrawMethod._id;
  transaction.fundAttachment = req.body.fundAttachment;
  transaction.createdBy = new Types.ObjectId(req.loggedUser.id);
  transaction.status = FundedTransactionStatus.SUCCESS;
  await transaction.save();

  res.status(200).json({ message: 'success', data: transaction });
};
