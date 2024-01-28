import { Types } from 'mongoose';
export interface Iplan {
  id: string;
  title: string;
  key: string;
  role: Types.ObjectId;
  status: boolean;
}
