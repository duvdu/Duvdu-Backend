import mongoose, { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface IstudioBooking {
  id: string;
  user: Types.ObjectId;
  attachments: string[];
  cover: string;
  studioName: string;
  studioNumber: string;
  studioEmail: string;
  desc: string;
  equipments: { name: string; fees: number }[];
  location: { lat: number; lng: number };
  searchKeywords: string[];
  pricePerHour: number;
  insurance: number;
  showOnHome: boolean;
  category: Types.ObjectId;
  cycle: number;
  rate: { ratersCounter: number; totalRates: number };
  isDeleted: boolean;
  creatives: { creative: Types.ObjectId | Iuser; fees: number }[];
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
      cycle: { type: Number, default: 2 },
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
