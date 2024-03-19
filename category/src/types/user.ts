import { Document, Types } from 'mongoose';

export interface Iuser extends Document {
  isVerified?: {
    value:boolean,
    reason:string
  };
  token: string;
  isBlocked: boolean;
  status: {
    value: boolean;
    reason: string;
  };
  role: Types.ObjectId;
}
