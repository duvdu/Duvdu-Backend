import { model, Schema, Types } from 'mongoose';
import { MODELS } from '../types/model-names';

export interface Ifavourite {
  project: Types.ObjectId;
  ref: string;
  user: Types.ObjectId;
}

export const Favourites = model<Ifavourite>(
  'favourites',
  new Schema<Ifavourite>(
    {
      project: { type: Schema.Types.ObjectId, ref: MODELS.projects },
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
    },
    { timestamps: true, collection: 'favourites' },
  )
    .index({ createdAt: -1, project: 1, user: 1 })
    .index({ project: 1, user: 1 }, { unique: true }),
);
