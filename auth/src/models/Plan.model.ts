import { Schema, model } from 'mongoose';

import { Iplan } from '../types/Plan';

const planSchema = new Schema<Iplan>({
  role: Schema.Types.ObjectId,
});

export const Plans = model<Iplan>('role', planSchema);
