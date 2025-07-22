import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';

export enum FundedTransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface IFundedTransaction {
  user: Types.ObjectId;
  fundAmount: number;
  fundAttachment: string;
  fundingAmount: number;
  status: FundedTransactionStatus;
  createdBy: Types.ObjectId;
}

export const FundedTransaction = model<IFundedTransaction>(
  MODELS.fundedTransaction,
  new Schema<IFundedTransaction>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      createdBy: { type: Schema.Types.ObjectId, ref: MODELS.user },
      fundAmount: { type: Number, default: 0 },
      fundAttachment: { type: String, default: null },
      fundingAmount: { type: Number, default: 0 },
      status: { type: String, default: FundedTransactionStatus.PENDING },
    },
    { timestamps: true, collection: MODELS.fundedTransaction },
  ),
);
