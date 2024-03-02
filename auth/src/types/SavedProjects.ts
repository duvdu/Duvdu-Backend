import { Types } from 'mongoose';

import { Iproject } from './Projects';
import { Iuser } from './User';

export interface IsavedProject {
  user: Types.ObjectId | Iuser;
  title: string;
  projects: [Types.ObjectId | Iproject];
}
