import { model, Schema, Types } from 'mongoose';

import { IcopyRights } from './copyrights.model';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export enum CopyrightContractStatus {
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

export enum SubmitFilesStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
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
  status: CopyrightContractStatus;
  rejectedBy?: 'customer' | 'sp';
  paymentLink: string;
  submitFiles: { link: string; notes?: string  , status: SubmitFilesStatus , reason?: string, dateOfSubmission: Date}[];
  createdAt: Date;
  updatedAt: Date;
}

export const CopyrightContracts = model<IcopyrightContract>(
  MODELS.copyrightContract,
  new Schema<IcopyrightContract>(
    {
      customer: { type: Schema.Types.ObjectId, ref: MODELS.user },
      sp: { type: Schema.Types.ObjectId, ref: MODELS.user },
      project: { type: Schema.Types.ObjectId, ref: 'rentals' },
      details: { type: String, default: null },
      attachments: [String],
      location: { lat: Number, lng: Number },
      address: { type: String, default: null },
      totalPrice: Number,
      startDate: Date,
      duration: { value: Number, unit: String },
      deadline: Date,
      appointmentDate: Date,
      stageExpiration: Number,
      actionAt: { type: Date, default: null },
      firstCheckoutAt: { type: Date, default: null },
      totalCheckoutAt: { type: Date, default: null },
      firstPaymentAmount: { type: Number, default: null },
      secondPaymentAmount: { type: Number, default: null },
      status: { type: String, enum: CopyrightContractStatus },
      submitFiles: [{
        link: { type: String, default: null },
        notes: { type: String, default: null },
        reason: { type: String, default: null },
        status: { type: String, enum: SubmitFilesStatus, default: SubmitFilesStatus.pending },
        dateOfSubmission: { type: Date, default: null },
      }],
      rejectedBy: { type: String, enum: ['sp', 'customer'], default: null },
      paymentLink: { type: String, default: null },
    },
    { collection: MODELS.copyrightContract, timestamps: true },
  ),
);
