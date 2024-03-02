import mongoose from 'mongoose';

import { Iterm } from '../types/Terms';

const termSchema = new mongoose.Schema<Iterm>(
  {
    desc: String,
  },
  { timestamps: true },
);

export const Term = mongoose.model<Iterm>('terms', termSchema);
