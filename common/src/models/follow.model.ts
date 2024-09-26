import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface Ifollow {
  follower: Types.ObjectId | Iuser;
  following: Types.ObjectId | Iuser;
}

export const Follow = model<Ifollow>(
  MODELS.follow,
  new Schema<Ifollow>(
    {
      follower: { type: Schema.Types.ObjectId, ref: MODELS.user },
      following: { type: Schema.Types.ObjectId, ref: MODELS.user },
    },
    { timestamps: true, collection: MODELS.follow },
  ),
);
