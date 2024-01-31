import { Types } from 'mongoose';
export interface Iplan {
  id: string;
  title: { ar: string; en: string };
  key: string;
  role: Types.ObjectId;
  status: boolean;
}
