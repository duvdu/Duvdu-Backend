import mongoose from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iterm } from '../types/Terms';

const termSchema = new mongoose.Schema<Iterm>(
  {
    desc: { type: String, default: null },
  },
  { timestamps: true, collection: MODELS.term },
);

export const Term = mongoose.model<Iterm>(MODELS.term, termSchema);
