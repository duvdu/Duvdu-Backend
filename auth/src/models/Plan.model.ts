import { Schema, model } from 'mongoose';

import { Iplan } from '../types/Plan';

const planSchema = new Schema<Iplan>(
  {
    key: { type: String, unique: true },
    role: { type: Schema.Types.ObjectId, ref: 'role' },
  },
  { collection: 'plan' },
);

export const Plans = model<Iplan>('plan', planSchema);
