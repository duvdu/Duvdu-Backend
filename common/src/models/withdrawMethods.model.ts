import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';

export enum WithdrawMethod {
  WALLET = 'wallet',
  BANK = 'bank',
}

export enum WithdrawMethodStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface IWithdrawMethod {
  user: Types.ObjectId;
  method: WithdrawMethod;
  name: string;
  number: string;
  iban: string;
  isDeleted: boolean;
  default: boolean;
  status: WithdrawMethodStatus;
}
// 
export const WithdrawMethodModel = model<IWithdrawMethod>(
  MODELS.withdrawMethod,
  new Schema<IWithdrawMethod>({
    user: { type: Schema.Types.ObjectId, ref: MODELS.user },
    method: { type: String, enum: WithdrawMethod },
    name: { type: String, default: null },
    number: { type: String, default: null },
    iban: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    default: { type: Boolean, default: false },
    status: { type: String, enum: WithdrawMethodStatus, default: WithdrawMethodStatus.ACTIVE },
  }),
);
