import { Iuser, MODELS, Irental } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';

export enum ContractStatus {
  canceled = 'canceled',
  pending = 'pending',
  waitingForPayment = 'waiting-for-payment',
  ongoing = 'ongoing',
  completed = 'completed',
  rejected = 'rejected',
  complaint = 'complaint',
}

export interface IrentalContract {
  id: string;
  customer: Types.ObjectId | Iuser;
  sp: Types.ObjectId | Iuser;
  project: Types.ObjectId | Irental;
  details: string;
  insurance: number;
  projectScale: { unit: string; numberOfUnits: number; unitPrice: number };
  totalPrice: number;
  startDate: Date;
  deadline: Date;
  stageExpiration: number;
  actionAt: Date;
  checkoutAt: Date;
  status: ContractStatus;
  rejectedBy?: 'customer' | 'sp';
  paymentLink: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RentalContracts = model<IrentalContract>(
  'rental_contracts',
  new Schema<IrentalContract>(
    {
      customer: { type: Schema.Types.ObjectId, ref: MODELS.user },
      sp: { type: Schema.Types.ObjectId, ref: MODELS.user },
      project: { type: Schema.Types.ObjectId, ref: 'rentals' },
      details: { type: String, default: null },
      insurance: Number,
      projectScale: { unit: String, numberOfUnits: Number, unitPrice: Number },
      totalPrice: Number,
      startDate: Date,
      deadline: Date,
      stageExpiration: Number, // hours
      actionAt: Date,
      checkoutAt: Date,
      status: { type: String, enum: ContractStatus },
      rejectedBy: { type: String, enum: ['sp', 'customer'], default: null },
      paymentLink: String,
    },
    { collection: 'rental_contracts', timestamps: true },
  ),
);
