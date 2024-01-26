import { Schema, model, Document } from 'mongoose';

import { Icategory } from '../types/Category';

const categorySchema = new Schema<Icategory & Document>({
  image: String,
  title: String,
});

export const Categories = model<Icategory & Document>('category', categorySchema);
