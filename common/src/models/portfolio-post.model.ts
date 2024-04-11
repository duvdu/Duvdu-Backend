import { Schema, model, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface IportfolioPost {
  id: string;
  user: Types.ObjectId;
  attachments: string[];
  cover: string;
  title: string;
  desc: string;
  address: string;
  tools: { name: string; fees: number }[];
  searchKeywords: string[];
  creatives: { creative: Types.ObjectId | Iuser; fees: number }[];
  tags: string[];
  projectBudget: number;
  category: Types.ObjectId;
  projectScale: { scale: number; time: 'minutes' | 'hours' };
  showOnHome: boolean;
  cycle: number;
  isDeleted: boolean;
}

export const PortfolioPosts = model<IportfolioPost>(
  MODELS.portfolioPost,
  new Schema<IportfolioPost>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      attachments: [String],
      cover: String,
      title: String,
      desc: String,
      address: String,
      tools: [{ name: String, fees: Number }],
      searchKeywords: [String],
      creatives: [{ creative: { type: Schema.Types.ObjectId, ref: MODELS.user }, fees: Number }],
      tags: [String],
      projectBudget: Number,
      category: Types.ObjectId,
      projectScale: { scale: Number, time: String },
      showOnHome: Boolean,
      cycle: { type: Number, default: 1 },
      isDeleted: { type: Boolean, default: false },
    },
    {
      timestamps: true,
      collection: MODELS.portfolioPost,
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
  )
    .index({ createdAt: 1, updatedAt: -1 })
    .index({ title: 'text', desc: 'text', tools: 'text', searchKeywords: 'text' }),
);
