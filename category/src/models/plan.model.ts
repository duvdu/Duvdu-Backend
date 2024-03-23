import { MODELS } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { Iplan } from '../types/plan';

const planSchema = new mongoose.Schema<Iplan>(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    collection:MODELS.plan
  },
);


export const Plan = mongoose.model<Iplan>(MODELS.plan, planSchema);
