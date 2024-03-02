import { Schema, model } from 'mongoose';

import { Icategory } from '../types/Category';

const categorySchema = new Schema<Icategory>(
  {
    image: String,
    title: String,
  },
  { collection: 'category' },
);

export const Categories = model<Icategory>('category', categorySchema);
