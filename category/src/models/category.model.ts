import mongoose from 'mongoose';

import { Icategory } from '../types/Category';
const categorySchema = new mongoose.Schema<Icategory>(
  {
    creativesCounter: {
      type: Number,
      default: 0,
    },
    title: {
      ar: String,
      en: String,
    },
    image: String,
    jobTitles: {
      type: [String],
    },
    cycle: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: 1,
    },
    tags: {
      type: [String],
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

export const Category = mongoose.model<Icategory>('categories', categorySchema);
