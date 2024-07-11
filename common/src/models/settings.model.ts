import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';

export interface Isetting {
  expirationTime: { time: number }[];
  default_profile: string;
  default_cover: string;
}

export const Setting = model<Isetting>(
  MODELS.setting,
  new Schema<Isetting>(
    {
      expirationTime: [{ time: { type: Number, unique: true } }],
      default_profile: String,
      default_cover: String,
    },
    { timestamps: true, collection: MODELS.setting },
  ),
);