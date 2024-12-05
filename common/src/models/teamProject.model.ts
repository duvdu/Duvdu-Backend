import { model, Schema, Types } from 'mongoose';

import { Icategory } from '../types/Category';
import { CYCLES } from '../types/cycles';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export enum UserStatus {
  accepted = 'accepted',
  rejected = 'rejected',
  pending = 'pending',
  canceled = 'canceled',
}


export interface ITeamProject {
  user: Types.ObjectId | Iuser;
  cover: string;
  title: string;
  desc: string;
  location: { lat: number; lng: number };
  address: string;
  cycle: string;
  creatives: [
    {
      category: Types.ObjectId | Icategory;
      users: [
        {
          user: Types.ObjectId | Iuser;
          attachments: string[];
          duration: number;
          startDate: Date;
          workHours: number;
          hourPrice: number;
          details: string;
          deadLine: Date;
          totalAmount: number;
          status: UserStatus;
          contract:Types.ObjectId
        },
      ];
    },
  ];
  isDeleted: boolean;
}

const UserSchema = new Schema<ITeamProject['creatives'][0]['users'][0]>({
  user: { type: Schema.Types.ObjectId, ref: MODELS.user },
  contract: { type: Schema.Types.ObjectId, ref: MODELS.user },
  attachments: [String],
  duration: { type: Number, default: 0 },
  startDate: Date,
  workHours: { type: Number, default: 0 },
  hourPrice: { type: Number, default: 0 },
  details: { type: String, default: null },
  deadLine: Date,
  totalAmount: { type: Number, default: 0 },
  status: { type: String, enum: UserStatus, default: UserStatus.pending },
});

const CreativeSchema = new Schema<ITeamProject['creatives'][0]>({
  category: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: MODELS.category,
  },
  users: [UserSchema],
});

export const TeamProject = model<ITeamProject>(
  MODELS.teamProject,
  new Schema<ITeamProject>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      cover: { type: String, default: null },
      title: { type: String, default: null },
      desc: { type: String, default: null },
      location: { lat: { type: Number, default: null }, lng: { type: Number, default: null } },
      address: { type: String, default: null },
      creatives: [CreativeSchema],
      isDeleted: { type: Boolean, default: false },
      cycle: { type: String, default: CYCLES.teamProject },
    },
    {
      timestamps: true,
      collection: MODELS.teamProject,
      toJSON: {
        transform(doc, ret) {
          if (ret.cover) ret.cover = process.env.BUCKET_HOST + '/' + ret.cover;
          if (ret.creatives && ret.creatives.length > 0) {
            ret.creatives.forEach((creative: any) => {
              if (creative.users && creative.users.length > 0) {
                creative.users.forEach((user: any) => {
                  if (user.attachments && user.attachments.length > 0) {
                    user.attachments = user.attachments.map(
                      (attachment: string) => process.env.BUCKET_HOST + '/' + attachment,
                    );
                  }
                });
              }
            });
          }
        },
      },
    },
  ),
);

// contract
export enum TeamContractStatus {
  canceled = 'canceled',
  pending = 'pending',
  waitingForTotalPayment = 'waiting-for-total-payment',
  ongoing = 'ongoing',
  completed = 'completed',
  rejected = 'rejected',
}

export interface ITeamContract {
  sp: Types.ObjectId | Iuser;
  customer: Types.ObjectId | Iuser;
  project: Types.ObjectId | ITeamProject;
  category: Types.ObjectId | Icategory;
  startDate: Date;
  duration: Date;
  workHours: number;
  hourPrice: number;
  deadline: Date;
  details: string;
  attachments: string[];
  totalPrice: number;
  actionAt: Date;
  rejectedBy?: 'customer' | 'sp';
  paymentLink: string;
  stageExpiration: number;
  status: TeamContractStatus;
  cycle: CYCLES;
  createdAt: Date;
  paymentAmount: number;
  totalCheckoutAt: Date;
  submitFiles: { link: string; notes: string };

}

export const TeamContract = model<ITeamContract>(
  MODELS.teamContract,
  new Schema<ITeamContract>(
    {
      sp: { type: Schema.Types.ObjectId, ref: MODELS.user },
      customer: { type: Schema.Types.ObjectId, ref: MODELS.user },
      project: { type: Schema.Types.ObjectId, ref: MODELS.teamProject },
      category: { type: Schema.Types.ObjectId, ref: MODELS.category },
      startDate: Date,
      duration: Date,
      workHours: { type: Number, default: 0 },
      hourPrice: { type: Number, default: 0 },
      deadline: Date,
      details: { type: String, default: null },
      totalPrice: { type: Number, default: 0 },
      actionAt: Date,
      rejectedBy: { type: String, enum: ['customer', 'sp'] },
      paymentLink: { type: String, default: null },
      stageExpiration: { type: Number, default: 0 },
      status: { type: String, enum: TeamContractStatus, default: TeamContractStatus.pending },
      cycle: { type: String, default: CYCLES.teamProject },
      paymentAmount: { type: Number, default: 0 },
      attachments: [String],
      totalCheckoutAt: Date,
      submitFiles: { link: { type: String, default: null }, notes: { type: String, default: null } },
    },
    { timestamps: true, collection: MODELS.teamContract },
  ),
);
