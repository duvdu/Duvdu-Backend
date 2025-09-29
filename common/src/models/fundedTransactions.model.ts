import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';

export enum FundedTransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

const generateFundedTransactionTicketNumber = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `FND${random}`;
};

export interface IFundedTransaction {
  user: Types.ObjectId;
  fundAmount: number;
  fundAttachment: string;
  status: FundedTransactionStatus;
  createdBy: Types.ObjectId;
  withdrawMethod: Types.ObjectId;
  contract: Types.ObjectId;
  ticketNumber: string;
  completedAt: Date;
}

export const FundedTransaction = model<IFundedTransaction>(
  MODELS.fundedTransaction,
  new Schema<IFundedTransaction>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      createdBy: { type: Schema.Types.ObjectId, ref: MODELS.user },
      fundAmount: { type: Number, default: 0 },
      fundAttachment: { type: String, default: null },
      contract: { type: Schema.Types.ObjectId },
      status: { type: String, default: FundedTransactionStatus.PENDING },
      withdrawMethod: { type: Schema.Types.ObjectId, ref:MODELS.withdrawMethod },
      ticketNumber: { type: String, default: generateFundedTransactionTicketNumber, unique: true, sparse: true },
      completedAt: { type: Date, default: null },
    },
    { timestamps: true, collection: MODELS.fundedTransaction },
  ),
);
