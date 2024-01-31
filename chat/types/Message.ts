import { ObjectId } from 'mongoose';

export interface Imessage {
  id: string;
  sourceUser: ObjectId;
  targetUser: ObjectId;
  isNoticed: boolean;
  isWatched: boolean;
  attachment: string;
  message: string;
}
