import { Document } from 'mongoose';

export interface Iplan extends Document {
  id: string;
  key: string;
  role: string;
}
