import { MODELS } from '@duvdu-v1/duvdu';
import { Schema, model, Types } from 'mongoose';

export interface Irate {
  sourceUser: Types.ObjectId;
  project: { id: Types.ObjectId; cycle: number };
  rate: number;
  desc: string;
}

export const Rates = model<Irate>(
  'rates',
  new Schema<Irate>({
    sourceUser: { type: Schema.Types.ObjectId, ref: MODELS.user },
    project: { type: Types.ObjectId, cycle: Number },
    rate: Number,
    desc: String,
  }),
);
