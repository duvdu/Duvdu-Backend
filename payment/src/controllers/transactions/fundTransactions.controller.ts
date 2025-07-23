import {
  BadRequestError,
  FOLDERS,
  Bucket,
  NotFound,
  Transaction,
  TransactionStatus,
  ITransaction,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

// Helper function to extract and validate file attachment
const extractFundAttachment = (req: any): Express.Multer.File[] => {
  const files = req.files as any;
  return files?.fundAttachment || [];
};

// Helper function to validate transaction existence and status
const validateTransactionForFunding = (
  transaction: ITransaction | null,
  lang: string,
): ITransaction => {
  if (!transaction) {
    throw new NotFound({ ar: 'المعاملة غير موجودة', en: 'Transaction not found' }, lang);
  }

  const allowedStatuses = [
    TransactionStatus.PENDING,
    TransactionStatus.FAILED,
  ];
  if (allowedStatuses.includes(transaction.status as TransactionStatus)) {
    throw new BadRequestError(
      { ar: 'حالة المعاملة غير صالحة للتمويل', en: 'Invalid transaction status for funding' },
      lang,
    );
  }

  return transaction;
};

// Helper function to validate funding amount
const validateFundingAmount = (
  transaction: ITransaction,
  requestedAmount: number,
  lang: string,
): void => {
  const currentFundingAmount = transaction.fundingAmount || 0;
  const totalAfterFunding = currentFundingAmount + requestedAmount;

  if (totalAfterFunding > transaction.amount) {
    throw new BadRequestError(
      {
        ar: 'المبلغ الإجمالي للتمويل أكبر من مبلغ المعاملة',
        en: 'Total funding amount exceeds transaction amount',
      },
      lang,
    );
  }

  if (requestedAmount <= 0) {
    throw new BadRequestError(
      {
        ar: 'مبلغ التمويل يجب أن يكون أكبر من الصفر',
        en: 'Funding amount must be greater than zero',
      },
      lang,
    );
  }
};

// Helper function to handle file upload to S3
const uploadFundingAttachment = async (
  fundAttachment: Express.Multer.File[],
): Promise<string | null> => {
  if (!fundAttachment.length) {
    return null;
  }

  const s3 = new Bucket();
  await s3.saveBucketFiles(FOLDERS.transactions, ...fundAttachment);
  return `${FOLDERS.transactions}/${fundAttachment[0].filename}`;
};

// Helper function to update transaction with funding details
const updateTransactionWithFunding = (
  transaction: ITransaction,
  fundingAmount: number,
  attachmentPath: string | null,
  fundedBy: string,
): void => {
  transaction.fundingAmount = (transaction.fundingAmount || 0) + fundingAmount;
  transaction.status = TransactionStatus.FUNDED;
  transaction.fundedAt = new Date();
  transaction.fundedBy = new Types.ObjectId(fundedBy);

  if (attachmentPath) {
    if (transaction.fundAttachment?.length) {
      transaction.fundAttachment.push(attachmentPath);
    } else {
      transaction.fundAttachment = [attachmentPath];
    }
  }
};

export const fundTransactions: RequestHandler<
  { transactionId: string },
  SuccessResponse<{ data: ITransaction }>,
  Pick<ITransaction, 'fundingAmount' | 'fundAttachment'>
> = async (req, res) => {
  // Extract and validate request data
  const fundAttachment = extractFundAttachment(req);
  const { fundingAmount } = req.body;

  // Find and validate transaction
  const transaction = await Transaction.findById(req.params.transactionId);
  const validatedTransaction = validateTransactionForFunding(transaction, req.lang);

  // Validate funding amount
  validateFundingAmount(validatedTransaction, fundingAmount, req.lang);

  // Handle file upload
  const attachmentPath = await uploadFundingAttachment(fundAttachment);

  // Update transaction with funding details
  const fundedBy = req.loggedUser.id;
  updateTransactionWithFunding(validatedTransaction, fundingAmount, attachmentPath, fundedBy);

  // Save updated transaction
  await (validatedTransaction as any).save();

  // Return success response
  res.status(200).json({
    message: 'success',
    data: validatedTransaction,
  });
};
