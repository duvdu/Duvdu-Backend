import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export enum ContractStatus {
  canceled = 'canceled',
  pending = 'pending',
  waitingForPayment = 'waiting for payment',
  ongoing = 'ongoing',
  completed = 'completed',
  rejected = 'rejected',
}

enum RefModels {
  copyright = MODELS.copyrightsBooking,
  studio = MODELS.studioBookingBook,
  portfolioPost = MODELS.portfolioPostBooking,
  teamProject = MODELS.teamProjectBooking,
}

export interface Icontract {
  id: string;
  sourceUser: Iuser | Types.ObjectId;
  targetUser: Iuser | Types.ObjectId;
  project: Types.ObjectId;
  details: string;
  book: Types.ObjectId;
  ref: RefModels;
  startDate: Date;
  deadline: Date;
  status: ContractStatus;
  submitedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const Contracts = model<Icontract>(
  MODELS.contracts,
  new Schema<Icontract>(
    {
      sourceUser: { type: Schema.Types.ObjectId, ref: MODELS.user },
      targetUser: { type: Schema.Types.ObjectId, ref: MODELS.user },
      project: { type: Schema.Types.ObjectId, ref: MODELS.projects },
      book: { type: Schema.Types.ObjectId, refPath: 'ref' },
      ref: { type: String, enum: RefModels, required: true },
      startDate: { type: Date, required: true },
      deadline: { type: Date, required: true },
      status: {
        type: String,
        enum: ContractStatus,
        required: true,
        default: ContractStatus.pending,
      },
      submitedAt: Date,
    },
    { timestamps: true, collection: MODELS.contracts },
  ),
);
