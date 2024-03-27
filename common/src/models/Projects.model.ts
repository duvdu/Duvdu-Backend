import { Schema, model } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iproject } from '../types/Projects';

export const Projects = model<Iproject>(
  MODELS.project,
  new Schema<Iproject>(
    {
      title: String,
      cover: String,
      owner: { type: Schema.Types.ObjectId, ref: MODELS.user },
    },
    { timestamps: true, collection: MODELS.project },
  ).index({ createdAt: 1, updatedAt: -1 }),
);
