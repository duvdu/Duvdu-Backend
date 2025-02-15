import { model, Schema, Types } from 'mongoose';

import { Irental } from './rental.model';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export enum RentalContractStatus {
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
  attachments: string[];
  details: string;
  insurance: number;
  projectScale: { unit: string; numberOfUnits: number; unitPrice: number };
  location: { lat: number; lng: number };
  address: string;
  totalPrice: number;
  startDate: Date;
  deadline: Date;
  stageExpiration: number;
  actionAt: Date;
  checkoutAt: Date;
  status: RentalContractStatus;
  rejectedBy?: 'customer' | 'sp';
  paymentLink: string;
  qrCodeVerification: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const RentalContracts = model<IrentalContract>(
  MODELS.rentalContract,
  new Schema<IrentalContract>(
    {
      customer: { type: Schema.Types.ObjectId, ref: MODELS.user },
      sp: { type: Schema.Types.ObjectId, ref: MODELS.user },
      project: { type: Schema.Types.ObjectId, ref: 'rentals' },
      details: { type: String, default: null },
      attachments: [String],
      insurance: { type: Number, default: null },
      projectScale: { unit: String, numberOfUnits: Number, unitPrice: Number },
      location: { lat: Number, lng: Number },
      address: String,
      totalPrice: Number,
      startDate: Date,
      deadline: Date,
      stageExpiration: Number, // hours
      actionAt: { type: Date, default: null },
      checkoutAt: { type: Date, default: null },
      status: { type: String, enum: RentalContractStatus },
      rejectedBy: { type: String, enum: ['sp', 'customer'], default: null },
      paymentLink: { type: String, default: null },
      qrCodeVerification: { type: Boolean, default: false },
    { collection: MODELS.rentalContract, timestamps: true },
  ),
);
