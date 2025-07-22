import { Types, model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

// Function to generate simple unique ticket number
export const generateTicketNumber = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `TKT${random}`;
};

export interface Icontract {
  id: string;
  customer: Types.ObjectId | Iuser;
  sp: Types.ObjectId | Iuser;
  contract: Types.ObjectId;
  ref: string;
  cycle: string;
  coupons: Types.ObjectId[];
  ticketNumber: string;
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
      ticketNumber: { type: String, default: null },
    },
    { timestamps: true, collection: MODELS.allContracts },
  ),
);

export interface IcontractReport {
  ticketNumber: string;
  reporter: Types.ObjectId | Iuser;
  contract: Types.ObjectId | Icontract;
  ref: string;
  desc: string;
  attachments: string[];
  state: [{ addedBy: Types.ObjectId; feedback: string }];
  isClosed: boolean;
  closedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ContractReports = model<IcontractReport>(
  MODELS.contractReports,
  new Schema<IcontractReport>(
    {
      ticketNumber: { type: String, default: generateTicketNumber, unique: true },
      reporter: { type: Schema.Types.ObjectId, ref: MODELS.user },
      contract: { type: Schema.Types.ObjectId, refPath: 'ref' },
      ref: String,
      desc: { type: String, default: null },
      attachments: [String],
      state: [
        {
          addedBy: {
            type: Schema.Types.ObjectId,
            ref: MODELS.user,
            default: null,
          },
          feedback: { type: String, default: null },
        },
      ],
      isClosed: {
        type: Boolean,
        default: false,
      },
      closedBy: {
        type: Schema.Types.ObjectId,
        ref: MODELS.user,
        default: null,
      },
    },
    { collection: MODELS.contractReports, timestamps: true },
  ).index({ reporter: 1, contract: 1 }, { unique: true }),
);
