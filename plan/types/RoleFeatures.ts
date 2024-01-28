import { Types } from 'mongoose';
export interface IroleFeatures {
  id: string;
  role: Types.ObjectId;
  feature: Types.ObjectId;
}
