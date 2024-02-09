import { Document, Types } from 'mongoose';

export interface Icontract extends Document {
  sourceUser: Types.ObjectId;
  targetUser: Types.ObjectId;
  creatives: Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'ongoing' | 'canceled' | 'completed' | 'rejected';
  submit: { link: string; notes: string };
}
