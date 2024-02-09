import { Types, Document } from 'mongoose';

export interface Iorder extends Document {
  id: string;
  sourceUser: Types.ObjectId;
  creatives: Types.ObjectId[];
  projectId: Types.ObjectId;
  status: 'canceled' | 'pending' | 'paid';
  totalAmount: number;
}
