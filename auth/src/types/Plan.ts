import { Document } from 'mongoose';

export interface Iplan extends Document {
  id: string;
  role: string;
}
