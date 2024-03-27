import { Types } from 'mongoose';

import { Irole } from './Role';

export interface Iplan {
  id: string;
  title: { ar: string; en: string };
  key: string;
  role: Types.ObjectId | Irole;
  status: boolean;
}
