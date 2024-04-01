import { Schema, model } from 'mongoose';

import { MODELS } from '@duvdu-v1/duvdu';

const categorySchema = new Schema<Icategory>(
  {
    image: String,
    title: String,
  },
  { collection: MODELS.category }
);

export const Categories = model<Icategory>(MODELS.category, categorySchema);
