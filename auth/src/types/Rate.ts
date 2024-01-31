import { Types } from 'mongoose';

export interface Irate {
  id: string;
  sourceUser: Types.ObjectId;
  project: Types.ObjectId;
  rate: number;
  desc: string;
}
