import { Types, model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface Icontract {
  id: string;
  customer: Types.ObjectId | Iuser;
  sp: Types.ObjectId | Iuser;
  contract: Types.ObjectId;
  ref: string;
  cycle:string
}

export const Contracts = model<Icontract>(
  'all_contracts',
  new Schema<Icontract>({
    customer: { type: Schema.Types.ObjectId, ref: MODELS.user },
    sp: { type: Schema.Types.ObjectId, ref: MODELS.user },
    contract: { type: Schema.Types.ObjectId, refPath: 'ref' },
    ref: String,
    cycle:{type:String , default:null}
  }),
);
