import { Types, Document } from 'mongoose';

export interface Iproject extends Document {
  id: string;
  user: Types.ObjectId;
  category: Types.ObjectId;
  price: number;
  duration: string;
  address: string;
  searchKeywords: string[];
}
