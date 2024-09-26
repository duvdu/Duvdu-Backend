import { Types, model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface Icontract {
  id: string;
  customer: Types.ObjectId | Iuser;
  sp: Types.ObjectId | Iuser;
  contract: Types.ObjectId;
  ref: string;
  cycle: string;
  coupons: Types.ObjectId[];
}

export const Contracts = model<Icontract>(
  MODELS.allContracts,
  new Schema<Icontract>(
    {
      customer: { type: Schema.Types.ObjectId, ref: MODELS.user },
      sp: { type: Schema.Types.ObjectId, ref: MODELS.user },
      contract: { type: Schema.Types.ObjectId, refPath: 'ref' },
      ref: String,
      cycle: { type: String, default: null },
      coupons: [{ type: Schema.Types.ObjectId, ref: MODELS.coupon }],
    },
    { timestamps: true, collection: MODELS.allContracts },
  ),
);

export interface IcontractReport {
  reporter: Types.ObjectId | Iuser;
  contract: Types.ObjectId | Icontract;
  ref: string;
  desc: string;
  attachments: string[];
  state: { isClosed: boolean; closedBy: Types.ObjectId; feedback: string };
  createdAt: Date;
  updatedAt: Date;
}

export const ContractReports = model<IcontractReport>(
  MODELS.contractReports,
  new Schema<IcontractReport>(
    {
      reporter: { type: Schema.Types.ObjectId, ref: MODELS.user },
      contract: { type: Schema.Types.ObjectId, refPath: 'ref' },
      ref: String,
      desc: { type: String, default: null },
      attachments: [String],
      state: {
        isClosed: {
          type: Boolean,
          default: false,
        },
        closedBy: {
          type: Schema.Types.ObjectId,
          ref: MODELS.user,
          default: null,
        },
        feedback: { type: String, default: null },
      },
    },
    { collection: MODELS.contractReports, timestamps: true },
  ).index({ reporter: 1, contract: 1 }, { unique: true }),
);
