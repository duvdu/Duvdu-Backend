import { Document } from 'mongoose';

export interface Iuser extends Document {
  id: string;
  username: string;
  name: string;
  profileImage: string;
  isOnline: boolean;
}
