import { Schema, model } from 'mongoose';

import { Iproject } from '../types/Projects';

export const Projects = model<Iproject>(
  'projects',
  new Schema<Iproject>(
    {
      title: String,
      cover: String,
    },
    { timestamps: true },
  ).index({ createdAt: 1, updatedAt: -1 }),
);
