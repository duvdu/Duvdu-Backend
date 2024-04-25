import { Schema, model } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iplan } from '../types/Plan';

const planSchema = new Schema<Iplan>(
  {
    key: { type: String, unique: true },
    title: { type: String, default: null },
    role: { type: Schema.Types.ObjectId, ref: 'role', required: true },
    status: { type: Boolean, default: false },
  },
  { collection: MODELS.plan },
);

export const Plans = model<Iplan>(MODELS.plan, planSchema);
