import { Iuser, MODELS } from '@duvdu-v1/duvdu';
import { Schema, model, Types } from 'mongoose';

export interface Iproject {
  id: string;
  user: Types.ObjectId;
  attachments: [string];
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
}

export const Projects = model<Iproject>(
  'portfolio-post',
  new Schema<Iproject>(
    {
      user: Types.ObjectId,
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
    },
    { timestamps: true, collection: 'portfolio-post' },
  ).index({ createdAt: 1, updatedAt: -1 }),
);
