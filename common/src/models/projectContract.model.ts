import { model, Schema, Types } from 'mongoose';

import { IprojectCycle } from './portfolio-post.model';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export enum ProjectContractStatus {
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

export interface IprojectContract {
  sp: Types.ObjectId | Iuser;
  customer: Types.ObjectId | Iuser;
  project: Types.ObjectId | IprojectCycle;
  tools: { name: string; unitPrice: number; units: number }[];
  functions: { name: string; unitPrice: number; units: number }[];
  details: string;
  location: { lat: string; lng: string };
  address: string;
  attachments: string[];
  projectScale: { unit: string; numberOfUnits: number; unitPrice: number };
  appointmentDate: Date;
  equipmentPrice: number;
  totalPrice: number;
  deadline: Date;
  startDate: Date;
  stageExpiration: number;
  actionAt: Date;
  firstCheckoutAt: Date;
  totalCheckoutAt: Date;
  firstPaymentAmount: number;
  secondPaymentAmount: number;
  status: ProjectContractStatus;
  rejectedBy?: 'customer' | 'sp';
  paymentLink: string;
  duration: number;
  createdAt: Date;
  submitFiles: { link: string; notes: string };
}

export const ProjectContract = model<IprojectContract>(
  MODELS.projectContract,
  new Schema<IprojectContract>(
    {
      sp: { type: Schema.Types.ObjectId, ref: MODELS.user },
      customer: { type: Schema.Types.ObjectId, ref: MODELS.user },
      project: { type: Schema.Types.ObjectId, ref: MODELS.portfolioPost },
      tools: [
        {
          name: { type: String, default: null },
          unitPrice: { type: Number, default: 0 },
          units: { type: Number, default: 0 },
        },
      ],
      functions: [
        {
          name: { type: String, default: null },
          unitPrice: { type: Number, default: 0 },
          units: { type: Number, default: 0 },
        },
      ],
      details: { type: String, default: null },
      location: { lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 } },
      address: { type: String, default: null },
      attachments: [String],
      projectScale: {
        unit: { type: String, default: null },
        numberOfUnits: { type: Number, default: 0 },
        unitPrice: { type: Number, default: 0 },
      },
      appointmentDate: Date,
      totalPrice: { type: Number, default: 0 },
      deadline: Date,
      startDate: Date,
      stageExpiration: { type: Number, default: 0 },
      actionAt: Date,
      firstCheckoutAt: Date,
      totalCheckoutAt: Date,
      firstPaymentAmount: { type: Number, default: 0 },
      secondPaymentAmount: { type: Number, default: 0 },
      status: { type: String, enum: ProjectContractStatus },
      rejectedBy: { type: String, enum: ['sp', 'customer'], default: null },
      paymentLink: String,
      duration: { type: Number, default: 0 },
      equipmentPrice: { type: Number, default: 0 },
      submitFiles: {
        link: { type: String, default: null },
        notes: { type: String, default: null },
      },
    },
    { timestamps: true, collection: MODELS.projectContract },
  ),
);
