import { MODELS } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';

import { Iuser } from '../types/User';

export interface IContractCancel {
  contract: Types.ObjectId;
  cancelReason: string;
  user: Types.ObjectId | Iuser;
}

export const ContractCancel = model<IContractCancel>(
  MODELS.contractCancel,
  new Schema<IContractCancel>(
    {
      contract: { type: Schema.Types.ObjectId, default: null },
      cancelReason: { type: String, default: null },
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
    },
    { timestamps: true, collection: MODELS.contractCancel },
  ),
);
