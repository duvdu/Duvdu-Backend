import { MODELS } from '@duvdu-v1/duvdu';
import { Schema, model } from 'mongoose';

import { Icategory } from '../types/Category';

export interface Icategory {
  id: string;
  title: string;
  image: string;
}

const categorySchema = new Schema<Icategory>(
  {
    image: String,
    title: String,
  },
  { collection: MODELS.category },
);

export const Categories = model<Icategory>(MODELS.category, categorySchema);
