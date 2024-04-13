import { MODELS, Iuser, Icategory } from '@duvdu-v1/duvdu';
import { Schema, model, Types } from 'mongoose';

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
  'copyrights',
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
      collection: 'copyrights',
    },
  ).index({ createdAt: 1, updatedAt: -1 }),
);
