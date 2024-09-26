import { model, Schema, Types } from 'mongoose';
import { Iuser } from '../types/User';
import { MODELS } from '../types/model-names';

export interface IprojectCycle {
  user: Types.ObjectId | Iuser;
  category: Types.ObjectId | Iuser;
  subCategory: { ar: string; en: string };
  tags: { ar: string; en: string }[];
  cover: string;
  attachments: string[];
  name: string;
  description: string;
  tools: { name: string; unitPrice: number }[];
  functions: { name: string; unitPrice: number }[];
  creatives: Types.ObjectId[] | Iuser[];
  location: { lat: number; lng: number };
  address: string;
  searchKeyWords: string[];
  showOnHome: boolean;
  projectScale: {
    unit: string;
    minimum: number;
    current: number;
    maximum: number;
    pricerPerUnit: number;
  };
  isDeleted: boolean;
  rate: { ratersCounter: number; totalRates: number };
  duration: number;
  submitFiles: { files: string[]; url: string; note: string };
}

export const ProjectCycle = model<IprojectCycle>(
  MODELS.portfolioPost,
  new Schema<IprojectCycle>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      category: { type: Schema.Types.ObjectId, ref: MODELS.category },
      subCategory: { ar: { type: String, default: null }, en: { type: String, default: null } },
      tags: [{ ar: { type: String, default: null }, en: { type: String, default: null } }],
      cover: { type: String, default: null },
      attachments: [{ type: String, default: null }],
      name: { type: String, default: null },
      description: { type: String, default: null },
      tools: [{ name: { type: String, default: null }, unitPrice: { type: Number, default: 0 } }],
      functions: [
        { name: { type: String, default: null }, unitPrice: { type: Number, default: 0 } },
      ],
      creatives: [{ type: Schema.Types.ObjectId, ref: MODELS.user }],
      location: { lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 } },
      address: { type: String, default: null },
      searchKeyWords: [String],
      showOnHome: { type: Boolean, default: true },
      projectScale: {
        unit: String,
        minimum: Number,
        maximum: Number,
        current: Number,
        pricerPerUnit: Number,
      },
      isDeleted: { type: Boolean, default: false },
      rate: { ratersCounter: Number, totalRates: Number },
      duration: { type: Number, default: 0 },
      submitFiles: {
        files: [String],
        url: { type: String, default: null },
        note: { type: String, default: null },
      },
    },
    { timestamps: true, collection: MODELS.portfolioPost },
  ),
);
