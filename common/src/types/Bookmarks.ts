import { Types } from 'mongoose';

import { Iproject } from './Projects';
import { Iuser } from './User';

export interface Ibookmark {
  user: Types.ObjectId | Iuser;
  title: string;
  projects: [Types.ObjectId | Iproject];
}
