import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';

export interface Irank {
  actionCount: number;
  rank: string;
  favoriteCount: number;
  projectsLiked: number;
  projectsCount: number;
  color: string;
}

export const Rank = model<Irank>(
  MODELS.rank,
  new Schema<Irank>(
    {
      actionCount: { type: Number, unique: true, default: 0 },
      rank: { type: String, unique: true, default: null },
      color: { type: String, default: null },
      favoriteCount: { type: Number, default: 0 },
      projectsLiked: { type: Number, default: 0 },
      projectsCount: { type: Number, default: 0 },
    },
    { timestamps: true, collection: MODELS.rank },
  ),
);
