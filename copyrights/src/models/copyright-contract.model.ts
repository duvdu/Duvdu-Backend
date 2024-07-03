import { IcopyRights, Iuser, MODELS } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';

export enum ContractStatus {
  canceled = 'canceled',
  pending = 'pending',
  waitingForFirstPayment = 'waiting-for-pay-10',
  updateAfterFirstPayment = 'update-after-first-Payment',
  waitingForTotalPayment = 'waiting-for-total-payment',
  ongoing = 'ongoing',
  completed = 'completed',
  rejected = 'rejected',
  complaint = 'complaint',
}

export interface IcopyrightContract {
  id: string;
  customer: Types.ObjectId | Iuser;
  sp: Types.ObjectId | Iuser;
  project: Types.ObjectId | IcopyRights;
  details: string;
  attachments: string[];
  location: { lat: number; lng: number };
  address: string;
  totalPrice: number;
  deadline: Date;
  startDate: Date;
  duration: { value: number; unit: string };
  appointmentDate: Date;
  stageExpiration: number;
  actionAt: Date;
  firstCheckoutAt: Date;
  totalCheckoutAt: Date;
  firstPaymentAmount: number;
  secondPaymentAmount: number;
  status: ContractStatus;
  rejectedBy?: 'customer' | 'sp';
  paymentLink: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CopyrightContracts = model<IcopyrightContract>(
  'copyright_contracts',
  new Schema<IcopyrightContract>(
    {
      customer: { type: Schema.Types.ObjectId, ref: MODELS.user },
      sp: { type: Schema.Types.ObjectId, ref: MODELS.user },
      project: { type: Schema.Types.ObjectId, ref: 'rentals' },
      details: { type: String, default: null },
      attachments: [String],
      location: { lat: Number, lng: Number },
      address: String,
      totalPrice: Number,
      startDate: Date,
      duration: { value: Number, unit: String },
      deadline: Date,
      appointmentDate: Date,
      stageExpiration: Number,
      actionAt: Date,
      firstCheckoutAt: Date,
      totalCheckoutAt: Date,
      firstPaymentAmount: Number,
      secondPaymentAmount: Number,
      status: { type: String, enum: ContractStatus },
      rejectedBy: { type: String, enum: ['sp', 'customer'], default: null },
      paymentLink: String,
    },
    { collection: 'copyright_contracts', timestamps: true },
  ),
);
