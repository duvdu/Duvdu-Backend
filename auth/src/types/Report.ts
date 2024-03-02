import { Types } from 'mongoose';

import { Iproject } from './Projects';
import { Iuser } from './User';

export interface Ireport {
  sourceUser: Types.ObjectId | Iuser;
  targetUser: Types.ObjectId | Iuser;
  project: Types.ObjectId | Iproject;
  desc: string;
  attachments: [string];
  state: { isClosed: boolean; closedBy: Types.ObjectId; feedback: string };
}
