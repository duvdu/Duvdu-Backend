import { Document, Types } from 'mongoose';

import { Irole } from './Role';

export interface Iplan extends Document {
  id: string;
  title: { ar: string; en: string };
  key: string;
  role: Types.ObjectId | Irole;
  status: boolean;
}
