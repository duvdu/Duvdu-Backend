import { Types, ObjectId } from 'mongoose';

export interface Iproject {
  id: string;
  user: Types.ObjectId;
  attachments: [string];
  cover: string;
  title: string;
  desc: string;
  equipments: { name: string; fees: number }[];
  location: { lat: number; lng: number };
  tags: string[];
  pricePerHour: number;
  insurance: number;
  showOnHome: boolean;
  category: Types.ObjectId;
}
