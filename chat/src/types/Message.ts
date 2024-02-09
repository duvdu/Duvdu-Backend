import { Types, Document } from 'mongoose';

export interface Imessage extends Document {
  id: string;
  sourceUser: Types.ObjectId;
  targetUser: Types.ObjectId;
  isNoticed: boolean;
  isWatched: boolean;
  attachment: string;
  message: string;
}
