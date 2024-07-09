import { Icategory, MODELS } from '@duvdu-v1/duvdu';
import { Document, model, Schema, Types } from 'mongoose';

export enum UserStatus {
  accepted = 'accepted',
  rejected = 'rejected',
  pending = 'pending',
}

export interface IteamProject extends Document {
  user: Types.ObjectId;
  cover: string;
  title: string;
  desc: string;
  location: { lat: number; lng: number };
  address: string;
  creatives: [
    {
      category: Types.ObjectId | Icategory;
      users: [
        {
          user: Types.ObjectId;
          attachments: string[];
          duration: Date;
          startDate: Date;
          workHours: number;
          hourPrice: number;
          details: string;
          deadLine: Date;
          totalAmount: number;
          status: UserStatus;
        },
      ];
    },
  ];
  isDeleted: boolean;
}

const UserSchema = new Schema<IteamProject['creatives'][0]['users'][0]>({
  user: { type: Schema.Types.ObjectId, ref: MODELS.user },
  attachments: [String],
  duration: Date,
  startDate: Date,
  workHours: { type: Number, default: 0 },
  hourPrice: { type: Number, default: 0 },
  details: { type: String, default: null },
  deadLine: Date,
  totalAmount: { type: Number, default: 0 },
  status: { type: String, enum: UserStatus, default: UserStatus.pending },
});

const CreativeSchema = new Schema<IteamProject['creatives'][0]>({
  category: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: MODELS.category,
  },
  users: [UserSchema],
});

export const TeamProject = model<IteamProject>(
  MODELS.teamProject,
  new Schema<IteamProject>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      cover: { type: String, default: null },
      title: { type: String, default: null },
      desc: { type: String, default: null },
      location: { lat: { type: Number, default: null }, lng: { type: Number, default: null } },
      address: { type: String, default: null },
      creatives: [CreativeSchema],
      isDeleted: { type: Boolean, default: false },
    },
    {
      timestamps: true,
      collection: MODELS.teamProject,
      toJSON: {
        transform(doc, ret) {
          if (ret.cover) ret.cover = process.env.BUCKET_HOST + '/' + ret.cover;
          if (ret.attachments)
            ret.attachments = ret.attachments.map(
              (el: string) => process.env.BUCKET_HOST + '/' + el,
            );
        },
      },
    },
  ),
);
