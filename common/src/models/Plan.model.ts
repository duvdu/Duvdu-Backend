import { Schema, model } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iplan } from '../types/Plan';

const planSchema = new Schema<Iplan>(
  {
    key: { type: String, unique: true },
    title: String,
    role: { type: Schema.Types.ObjectId, ref: 'role' },
    status: { type: Boolean, default: false },
  },
  { collection: MODELS.plan },
);

export const Plans = model<Iplan>(MODELS.plan, planSchema);
