import { Types } from 'mongoose';

export interface Ifollow {
  sourceUser: Types.ObjectId;
  targetUser: Types.ObjectId;
}
