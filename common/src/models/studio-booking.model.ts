import mongoose, { model, Schema, Types } from 'mongoose';

import { CYCLES } from '../types/cycles';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface IstudioBooking {
  id: string;
  user: Types.ObjectId | Iuser;
  attachments: string[];
  cover: string;
  studioName: string;
  studioNumber: string;
  studioEmail: string;
  desc: string;
  equipments: { id: string; name: string; fees: number }[];
  location: { lat: number; lng: number };
  searchKeywords: string[];
  pricePerHour: number;
  insurance: number;
  showOnHome: boolean;
  category: Types.ObjectId;
  cycle: string;
  rate: { ratersCounter: number; totalRates: number };
  isDeleted: boolean;
  creatives: { creative: Types.ObjectId | Iuser; fees: number }[];
  tags: { ar: string; en: string }[];
  subCategory: { ar: string; en: string };
}

export const studioBooking = model<IstudioBooking>(
  MODELS.studioBooking,
  new Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: MODELS.user,
        required: true,
      },
      attachments: [String],
      cover: { type: String, default: null },
      studioName: { type: String, default: null },
      studioEmail: { type: String, default: null },
      desc: { type: String, default: null },
      equipments: [
        { name: { type: String, default: null }, fees: { type: Number, default: null } },
      ],
      location: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
      searchKeywords: [String],
      pricePerHour: { type: Number, default: null },
      insurance: { type: Number, default: null },
      showOnHome: { type: Boolean, default: true },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: MODELS.category,
        required: true,
      },
      cycle: { type: String, default: CYCLES.studioBooking },
      isDeleted: { type: Boolean, default: false },
      creatives: [
        {
          creative: { type: Schema.Types.ObjectId, ref: MODELS.user },
          fees: { type: Number, default: null },
        },
      ],
      rate: {
        ratersCounter: { type: Number, default: 0 },
        totalRates: { type: Number, default: 0 },
      },
      tags: [{ ar: { type: String, default: null }, en: { type: String, default: null } }],
      subCategory: {
        ar: String,
        en: String,
      },
    },
    {
      timestamps: true,
      collection: MODELS.studioBooking,
      toJSON: {
        transform(doc, ret) {
          if (ret.cover) ret.cover = process.env.BUCKET_HOST + '/' + ret.cover;
          if (ret.attachments)
            ret.attachments = ret.attachments.map(
              (el: string) => process.env.BUCKET_HOST + '/' + el,
            );
        },
      },
    },
  ),
);
