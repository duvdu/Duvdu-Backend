import { Types, Document } from 'mongoose';

export interface Iproject extends Document {
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
