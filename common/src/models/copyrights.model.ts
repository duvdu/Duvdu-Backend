import { Schema, model, Types } from 'mongoose';

import { Icategory } from '../types/Category';
import { CYCLES } from '../types/cycles';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface IcopyRights {
  id: string;
  user: Types.ObjectId | Iuser;
  category: Types.ObjectId | Icategory;
  price: number;
  duration: { value: number; unit: string };
  address: string;
  location: { lat: number; lng: number };
  searchKeywords: string[];
  showOnHome: boolean;
  cycle: string;
  rate: { ratersCounter: number; totalRates: number };
  isDeleted: boolean;
  tags: { ar: string; en: string }[];
  subCategory: { ar: string; en: string };
}

export const CopyRights = model<IcopyRights>(
  MODELS.copyrights,
  new Schema<IcopyRights>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      category: { type: Schema.Types.ObjectId, ref: MODELS.category },
      price: { type: Number, default: 0 },
      duration: { value: Number, unit: String },
      address: { type: String, default: null },
      searchKeywords: [String],
      showOnHome: { type: Boolean, default: true },
      cycle: { type: String, default: CYCLES.copyRights },
      isDeleted: { type: Boolean, default: false },
      rate: {
        ratersCounter: { type: Number, default: 0 },
        totalRates: { type: Number, default: 0 },
      },
      tags: [{ ar: { type: String, default: null }, en: { type: String, default: null } }],
      subCategory: {
        ar: String,
        en: String,
      },
      location: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
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
