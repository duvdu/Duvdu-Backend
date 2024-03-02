import { Types } from 'mongoose';

import { Iuser } from './User';

export interface Ifollow {
  sourceUser: Types.ObjectId | Iuser;
  targetUser: Types.ObjectId | Iuser;
}
