import { model, Schema, Types } from 'mongoose';

import { generateTicketNumber } from './all-contracts.model';
import { IProducerPlatform } from './producerPlatform.model';
import { Icategory } from '../types/Category';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface Iproducer {
  user: Types.ObjectId | Iuser;
  category: Types.ObjectId | Icategory;
  subCategories?: { title: { en: string; ar: string }; tags: { en: string; ar: string }[] }[];
  maxBudget: number;
  minBudget: number;
  searchKeywords: string[];
  platforms: Types.ObjectId[] | IProducerPlatform[];
  ticketNumber: string;
}

export const Producer = model<Iproducer>(
  MODELS.producer,
  new Schema<Iproducer>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: MODELS.user,
      },
      ticketNumber: { type: String, default: generateTicketNumber, unique: true, sparse: true },
      category: {
        type: Schema.Types.ObjectId,
        ref: MODELS.category,
      },
      subCategories: [
        {
          title: { ar: { type: String, default: null }, en: { type: String, default: null } },
          tags: [{ en: { type: String, default: null }, ar: { type: String, default: null } }],
        },
      ],
      minBudget: { type: Number, default: null },
      maxBudget: { type: Number, default: null },
      searchKeywords: [String],
      platforms: [{ type: Schema.Types.ObjectId, ref: MODELS.producerPlatforms }],
    },
    { timestamps: true, collection: MODELS.producer },
  ),
);
