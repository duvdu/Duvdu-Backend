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
  rate: { ratersCounter: number; totalRates: number };
  isDeleted: boolean;
}

export const CopyRights = model<IcopyRights>(
  MODELS.copyrights,
  new Schema<IcopyRights>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      category: { type: Schema.Types.ObjectId, ref: MODELS.category },
      price: { type: Number, default: 0 },
      duration: { type: String, default: null },
      address: { type: String, default: null },
      searchKeywords: [String],
      showOnHome: { type: Boolean, default: true },
      cycle: { type: Number, default: 3 },
      isDeleted: { type: Boolean, default: false },
      rate: {
        ratersCounter: { type: Number, default: 0 },
        totalRates: { type: Number, default: 0 },
      },
    },
    {
      timestamps: true,
      collection: MODELS.copyrights,
    },
  )
    .index({ createdAt: 1, updatedAt: -1 })
    .index({ searchKeywords: 'text' }),
);
