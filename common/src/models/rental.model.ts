import { model, Types, Schema } from 'mongoose';

import { Icategory } from '../types/Category';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export enum RentalUnits {
  minutes = 'minutes',
  hours = 'hours',
  days = 'days',
  months = 'months',
  weeks = 'weeks',
}

const generateTicketNumber = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `RNT${random}`;
};

export interface Irental {
  id: string;
  ticketNumber: string;
  user: Types.ObjectId | Iuser;
  category: Types.ObjectId | Icategory;
  subCategory: { ar: string; en: string; _id: string };
  tags: { ar: string; en: string }[];
  attachments: string[];
  cover: string;
  title: string;
  phoneNumber: string;
  email: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: string;
  searchKeywords: string[];
  insurance: number;
  showOnHome: boolean;
  projectScale: { unit: RentalUnits; minimum: number; maximum: number; pricerPerUnit: number };
  isDeleted: boolean;
  rate: { ratersCounter: number; totalRates: number };
  createdAt: Date;
  updatedAt: Date;
  minBudget: number;
  maxBudget: number;
}

export const Rentals = model<Irental>(
  'rentals',
  new Schema<Irental>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      ticketNumber: { type: String, default: generateTicketNumber, unique: true, sparse: true },
      category: { type: Schema.Types.ObjectId, ref: MODELS.category },
      subCategory: { ar: String, en: String, _id: String },
      tags: [{ ar: String, en: String }],
      attachments: [String],
      cover: String,
      title: String,
      phoneNumber: String,
      email: String,
      description: String,
      location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [31.2357, 30.0444] },
      },
      address: String,
      searchKeywords: [String],
      insurance: { type: Number, default: null },
      showOnHome: { type: Boolean, default: true },
      projectScale: {
        unit: { type: String, enum: RentalUnits },
        minimum: Number,
        maximum: Number,
        pricerPerUnit: Number,
      },
      isDeleted: { type: Boolean, default: false },
      rate: { ratersCounter: Number, totalRates: Number },
      minBudget: { type: Number, default: null },
      maxBudget: { type: Number, default: null },
    },
    { collection: 'rentals', timestamps: true },
  )
    .index({ createdAt: 1, updatedAt: -1 })
    .index({ location: '2dsphere' }),
);
