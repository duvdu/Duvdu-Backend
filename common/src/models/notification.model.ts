import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface Inotification {
  sourceUser: Types.ObjectId | Iuser;
  targetUser: Types.ObjectId | Iuser;
  type: string;
  target: Types.ObjectId;
  watched: boolean;
  message: string;
  title: string;
}

export const Notification = model<Inotification>(
  MODELS.notifications,
  new Schema<Inotification>(
    {
      sourceUser: {
        type: Schema.Types.ObjectId,
        ref: MODELS.user,
        // required:true
        default: null,
      },
      targetUser: {
        type: Schema.Types.ObjectId,
        ref: MODELS.user,
        required: true,
      },
      target: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      type: {
        type: String,
        default: null,
      },
      watched: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        trim: true,
        default: null,
      },
      message: {
        type: String,
        trim: true,
        default: null,
      },
    },
    { timestamps: true },
  ),
);
