import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export enum ContractStatus {
  canceled = 'canceled',
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
  acceptedWithUpdate = 'accepted with update',
  complaint = 'complaint',
}

const generateTicketNumber = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `PRC${random}`;
};

export interface IproducerContarct {
  ticketNumber: string;
  producer: Types.ObjectId | Iuser;
  sp: Types.ObjectId | Iuser;
  user: Types.ObjectId | Iuser;
  platform: string;
  projectDetails: string;
  episodesNumber: number;
  episodesDuration: number;
  expectedBudget: number;
  expectedProfits: number;
  attachments: string[];
  appointmentDate: Date;
  address: string;
  location: { lat: number; lng: number };
  rejectedBy: 'producer' | 'user' | 'system';
  status: ContractStatus;
  stageExpiration: number;
  actionAt: Date;
}

export const ProducerContract = model<IproducerContarct>(
  MODELS.producerContract,
  new Schema<IproducerContarct>(
    {
      ticketNumber: { type: String, default: generateTicketNumber, unique: true, sparse: true },
      producer: { type: Schema.Types.ObjectId, ref: MODELS.user },
      sp: { type: Schema.Types.ObjectId, ref: MODELS.user },
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      platform: { type: String, default: null },
      projectDetails: { type: String, default: null },
      episodesNumber: { type: Number, default: 0 },
      episodesDuration: { type: Number, default: 0 },
      expectedBudget: { type: Number, default: 0 },
      expectedProfits: { type: Number, default: 0 },
      address: { type: String, default: null },
      location: { lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 } },
      attachments: [String],
      appointmentDate: Date,
      rejectedBy: { type: String, enum: ['producer', 'user', 'system'] },
      status: { type: String, enum: ContractStatus, default: ContractStatus.pending },
      stageExpiration: { type: Number, default: 0 },
      actionAt: Date,
    },
    {
      timestamps: true,
      collection: MODELS.producerContract,
      toJSON: {
        transform(doc, ret) {
          if (ret.attachments)
            ret.attachments = ret.attachments.map(
              (el: string) => process.env.BUCKET_HOST + '/' + el,
            );
        },
      },
    },
  ),
);
