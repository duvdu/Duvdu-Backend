import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

interface Iproject {
  project: {
    type: Schema.Types.ObjectId;
  };
  ref: string;
  cycle: number;
  user: Types.ObjectId | Iuser;
  rate: { ratersCounter: number; totalRates: number };
}

export const Project = model<Iproject>(
  MODELS.projects,
  new Schema<Iproject>(
    {
      project: {
        type: {
          type: Schema.Types.ObjectId,
          refPath: 'project.ref',
        },
        ref: String,
      },
      ref: String,
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      rate: {
        ratersCounter: { type: Number, default: 0 },
        totalRates: { type: Number, default: 0 },
      },
    },
    { timestamps: true, collection: MODELS.projects },
  ).index({ createdAt: 1, updatedAt: -1, ref: 1 }),
);
