import { Schema, model, Types } from 'mongoose';

import { Icategory } from '../types/Category';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface IcopyRights {
  id: string;
  user: Types.ObjectId | Iuser;
  category: Types.ObjectId | Icategory;
  price: number;
  duration: string;
  address: string;
  searchKeywords: string[];
  showOnHome: boolean;
  cycle: number;
  isDeleted: boolean;
}

export const CopyRights = model<IcopyRights>(
  MODELS.copyrights,
  new Schema<IcopyRights>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user, unique: true },
      category: { type: Schema.Types.ObjectId, ref: MODELS.category },
      price: Number,
      duration: String,
      address: String,
      searchKeywords: [String],
      showOnHome: Boolean,
      cycle: { type: Number, default: 3 },
      isDeleted: { type: Boolean, default: false },
    },
    {
      timestamps: true,
      collection: MODELS.copyrights,
    },
  )
    .index({ createdAt: 1, updatedAt: -1 })
    .index({ searchKeywords: 'text' }),
);
