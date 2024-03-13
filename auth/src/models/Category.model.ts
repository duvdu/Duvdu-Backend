import { Schema, model } from 'mongoose';

import { Icategory } from '../types/Category';
import { MODELS } from '../types/model-names';

const categorySchema = new Schema<Icategory>(
  {
    image: String,
    title: String,
  },
  { collection: MODELS.category },
);

export const Categories = model<Icategory>(MODELS.category, categorySchema);
