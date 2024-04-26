import mongoose from 'mongoose';

import { Icategory } from '../types/Category';
import { CYCLES } from '../types/cycles';
import { MODELS } from '../types/model-names';
const categorySchema = new mongoose.Schema<Icategory>(
  {
    creativesCounter: {
      type: Number,
      default: 0,
    },
    title: {
      ar: { type: String, default: null },
      en: { type: String, default: null },
    },
    image: { type: String, defulat: null },
    jobTitles: {
      type: [String],
    },
    cycle: {
      type: Number,
      enum: CYCLES,
      required: true,
    },
    // tags: {
    //   type: [String],
    // },
    subCategories: [
      {
        title: { ar: { type: String, default: null }, en: { type: String, default: null } },
        tags: [{ ar: { type: String, default: null }, en: { type: String, default: null } }],
      },
    ],
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: MODELS.category,
    toJSON: {
      transform(doc, ret) {
        if (ret.image) ret.image = process.env.BUCKET_HOST + '/' + ret.image;
      },
    },
  },
);

export const Categories = mongoose.model<Icategory>(MODELS.category, categorySchema);
