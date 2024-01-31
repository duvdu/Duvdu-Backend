import { Document } from 'mongoose';

export interface Irole extends Document {
  id: string;
  key: string;
  features: string[];
}
