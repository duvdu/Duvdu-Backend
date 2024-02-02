import { Schema, model } from 'mongoose';

import { Iplan } from '../types/Plan';

const planSchema = new Schema<Iplan>({
  key: { type: String, unique: true },
  role: Schema.Types.ObjectId,
});

export const Plans = model<Iplan>('plan', planSchema);
