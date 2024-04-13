import { Types, Document } from 'mongoose';

export interface Iproject extends Document {
  id: string;
  user: Types.ObjectId;
  attachments: [string];
  cover: string;
  name: string;
  number: string;
  desc: string;
  equipments: { name: string; fees: number }[];
  address: string;
  canChangeAddress: boolean;
  searchKeywords: string[];
  pricePerHour: number;
  insurance: number;
  showOnHome: boolean;
  category: Types.ObjectId;
}
