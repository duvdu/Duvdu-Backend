import { model, Types, Schema } from 'mongoose';
import { Icategory } from '../types/Category';
import { Iuser } from '../types/User';
import { MODELS } from '../types/model-names';

export enum RentalUnits {
  minutes = 'minutes',
  hours = 'hours',
  days = 'days',
  months = 'months',
  weeks = 'weeks',
}

export interface Irental {
  id: string;
  user: Types.ObjectId | Iuser;
  category: Types.ObjectId | Icategory;
  subCategory: { ar: string; en: string };
  tags: { ar: string; en: string }[];
  attachments: string[];
  cover: string;
  title: string;
  phoneNumber: string;
  email: string;
  description: string;
  location: { lat: number; lng: number };
  address: string;
  searchKeywords: string[];
  insurance: number;
  showOnHome: boolean;
  projectScale: { unit: RentalUnits; minimum: number; maximum: number; pricerPerUnit: number };
  isDeleted: boolean;
  rate: { ratersCounter: number; totalRates: number };
  createdAt: Date;
  updatedAt: Date;
}

export const Rentals = model<Irental>(
  'rentals',
  new Schema<Irental>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      category: { type: Schema.Types.ObjectId, ref: MODELS.category },
      subCategory: { ar: String, en: String },
      tags: [{ ar: String, en: String }],
      attachments: [String],
      cover: String,
      title: String,
      phoneNumber: String,
      email: String,
      description: String,
      location: { lat: Number, lng: Number },
      address: String,
      searchKeywords: [String],
      insurance: Number,
      showOnHome: { type: Boolean, default: true },
      projectScale: {
        unit: { type: String, enum: RentalUnits },
        minimum: Number,
        maximum: Number,
        pricerPerUnit: Number,
      },
      isDeleted: { type: Boolean, default: false },
      rate: { ratersCounter: Number, totalRates: Number },
    },
    { collection: 'rentals', timestamps: true },
  ).index({ createdAt: 1, updatedAt: -1 }),
);
