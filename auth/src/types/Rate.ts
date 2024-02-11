import { Types } from 'mongoose';

import { Iproject } from './Projects';
import { Iuser } from './User';

export interface Irate {
  id: string;
  sourceUser: Types.ObjectId | Iuser;
  project: Types.ObjectId | Iproject;
  rate: number;
  desc: string;
}
