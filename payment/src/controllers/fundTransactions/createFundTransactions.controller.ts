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
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const createFundTransactions: RequestHandler<
  { transactionId: string },
  SuccessResponse<{ data: IFundedTransaction }>,
  Pick<IFundedTransaction, 'fundAmount' | 'fundAttachment' | 'user'>
> = async (req, res) => {
  const user = await Users.findById(req.params.transactionId);
  if (!user) throw new NotFound({ ar: 'المستخدم غير موجود', en: 'User not found' }, req.lang);

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
