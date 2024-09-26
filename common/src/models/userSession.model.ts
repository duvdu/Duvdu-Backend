import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface IuserSession {
  user: Types.ObjectId | Iuser;
  refreshToken: string;
  deviceId: string;
}

export const userSession = model<IuserSession>(
  MODELS.userSession,
  new Schema<IuserSession>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      refreshToken: { type: String, default: null },
      deviceId: { type: String, default: null },
    },
    { timestamps: true },
  ),
);
