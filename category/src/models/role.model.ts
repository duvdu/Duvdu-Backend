import { MODELS } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { Irole } from '../types/role';

const roleSchema = new mongoose.Schema<Irole>(
  {
    key: {
      type: String,
      unique: true,
    },
    features: [String],
    system:Boolean
  },
  {
    timestamps: true,
    collection:MODELS.role
  },
);

export const Role = mongoose.model<Irole>(MODELS.role, roleSchema);
