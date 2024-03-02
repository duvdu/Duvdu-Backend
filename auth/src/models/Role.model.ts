import { model, Schema } from 'mongoose';

import { Irole } from '../types/Role';

export const Roles = model<Irole>(
  'role',
  new Schema<Irole>(
    {
      key: { type: String, unique: true },
      features: [String],
    },
    { collection: 'role' },
  ),
);
