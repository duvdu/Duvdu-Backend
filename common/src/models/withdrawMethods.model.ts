import { MODELS } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';



export enum WithdrawMethod {
    WALLET = 'wallet',
    BANK = 'bank',
}


export interface IWithdrawMethod {
    user: Types.ObjectId;
    method: WithdrawMethod;
    name: string;
    number: string;
}


export const WithdrawMethodModel = model<IWithdrawMethod>(MODELS.withdrawMethod, new Schema<IWithdrawMethod>({
  user: { type: Schema.Types.ObjectId, ref: MODELS.user },
  method: { type: String, enum: WithdrawMethod },
  name: { type: String, default: null },
  number: { type: String, default: null },
}));



