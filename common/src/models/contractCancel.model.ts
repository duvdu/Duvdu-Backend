import { MODELS } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';

import { Iuser } from '../types/User';

export interface IContractCancel {
  contractId: Types.ObjectId;
  cancelReason: string;
  user: Types.ObjectId | Iuser;
}

export const ContractCancel = model<IContractCancel>(
  MODELS.contractCancel,
  new Schema<IContractCancel>(
    {
      contractId: { type: Schema.Types.ObjectId, default: null },
      cancelReason: { type: String, default: null },
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
    },
    { timestamps: true, collection: MODELS.contractCancel },
  ),
);
