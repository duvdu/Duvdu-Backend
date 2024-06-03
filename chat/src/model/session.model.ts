import { Iuser, MODELS } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';

export interface Isession {
  user: Types.ObjectId | Iuser;
  sessions: {
    startAt: Date;
    endAt: Date;
    duration: number;
    ipAddress: string;
    deviceInfo: any;
    activityLog: {
      timestamp: Date;
      activity: string;
    }[];
  }[];
}

export const Sessions = model<Isession>(
  'sessions',
  new Schema<Isession>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user, unique: true },
      sessions: [
        {
          startAt: Date,
          endAt: Date,
          duration: Number,
          ipAddress: String,
          deviceInfo: Schema.Types.Mixed,
          activityLog: [
            {
              timestamp: { type: Date, required: true },
              activity: { type: String, required: true },
            },
          ],
        },
      ],
    },
    { collection: 'sessions', timestamps: true },
  ).index({ updatedAt: -1 }),
);
