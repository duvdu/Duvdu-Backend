import { Types, Document } from 'mongoose';

export interface Inotification extends Document {
  id: string;
  sourceUserId: Types.ObjectId;
  targetUserId: Types.ObjectId;
  link?: string;
}
