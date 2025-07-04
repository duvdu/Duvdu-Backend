import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface ITransaction {
  currency: string;
  amount: number;
  user: Types.ObjectId;
  contract: Types.ObjectId;
  status: string;
  timeStamp: Date;
  model: string;
  isSubscription: boolean;
}

export const Transaction = model<ITransaction>(
  MODELS.transaction,
  new Schema<ITransaction>({
    currency: { type: String, default: 'EGP' },
    amount: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: MODELS.user },
    contract: { type: Schema.Types.ObjectId, ref: MODELS.contracts },
    status: { type: String, default: TransactionStatus.PENDING },
    timeStamp: { type: Date, default: Date.now },
    model: { type: String, default: null },
    isSubscription: { type: Boolean, default: false },
  }),
);
