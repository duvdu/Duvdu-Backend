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
    collection:'plan'
  },
);


export const Plan = mongoose.model<Iplan>('plan', planSchema);
