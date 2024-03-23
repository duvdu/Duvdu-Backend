import { MODELS } from '@duvdu-v1/duvdu';
import { model, Schema } from 'mongoose';

import { Irole } from '../types/Role';

export const Roles = model<Irole>(
  MODELS.role,
  new Schema<Irole>(
    {
      key: { type: String, unique: true },
      permissions: [String],
      system: {
        type: Boolean,
        default: false,
      },
    },
    { collection: MODELS.role },
  ),
);
