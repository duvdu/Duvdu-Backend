import { Schema, model, Types } from 'mongoose';

import { MODELS } from '@duvdu-v1/duvdu';

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
  creatives: { name: string; fees: number }[];
  tags: string[];
  projectBudget: number;
  category: Types.ObjectId;
  projectScale: { scale: number; time: 'minutes' | 'hours' };
  showOnHome: boolean;
}

export const Projects = model<Iproject>(
  MODELS.project,
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
      creatives: [{ name: String, fees: Number }],
      tags: [String],
      projectBudget: Number,
      category: Types.ObjectId,
      projectScale: { scale: Number, time: String },
      showOnHome: Boolean,
    },
    { timestamps: true, collection: MODELS.project }
  ).index({ createdAt: 1, updatedAt: -1 })
);
