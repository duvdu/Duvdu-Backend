import { Types, ObjectId } from 'mongoose';

export interface Iproject {
  id: string;
  user: Types.ObjectId;
  attachments: [string];
  cover: string;
  title: string;
  desc: string;
  address: string;
  tools: { name: string; fees: number }[];
  equipments: { name: string; fees: number }[];
  creatives: { name: string; fees: number }[];
  tags: string[];
  projectBudget: number;
  category: Types.ObjectId;
  projectScale: { scale: number; time: 'minutes' | 'hours' };
  showOnHome: boolean;
}
