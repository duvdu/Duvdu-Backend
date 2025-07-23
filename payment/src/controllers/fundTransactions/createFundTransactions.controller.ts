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

export const createFundTransactions: RequestHandler<
  unknown,
  SuccessResponse<{ data: IFundedTransaction }>,
  Pick<IFundedTransaction, 'fundAmount' | 'fundAttachment' | 'user' | 'withdrawMethod'>
> = async (req, res) => {
  const user = await Users.findById(req.body.user);
  if (!user) throw new NotFound({ ar: 'المستخدم غير موجود', en: 'User not found' }, req.lang);

  const withdrawMethod = await WithdrawMethodModel.findOne({
    _id: req.body.withdrawMethod,
    user: user._id,
    status: WithdrawMethodStatus.ACTIVE,
  });
  if (!withdrawMethod)
    throw new NotFound({ ar: 'الطريقة غير موجودة', en: 'Withdraw method not found' }, req.lang);

  const attachment = <Express.Multer.File[] | undefined>(req.files as any).fundAttachment || [];
  if (!attachment.length)
    throw new BadRequestError({ ar: 'المرفقات غير موجودة', en: 'Attachments not found' }, req.lang);

  const s3 = new Bucket();
  await s3.saveBucketFiles(FOLDERS.transactions, ...attachment);
  req.body.fundAttachment = `${FOLDERS.transactions}/${attachment[0].filename}`;

  const transaction = await FundedTransaction.create({
    ...req.body,
    createdBy: req.loggedUser.id,
    status: FundedTransactionStatus.SUCCESS,
  });
  res.status(201).json({ message: 'success', data: transaction });
};
