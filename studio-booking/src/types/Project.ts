import { Types, Document } from 'mongoose';

export interface Iproject extends Document {
  id: string;
  user: Types.ObjectId;
  attachments: [string];
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
  cycle:number;
  isDeleted: boolean;
}
