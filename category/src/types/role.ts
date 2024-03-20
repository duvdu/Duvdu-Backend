import { Document } from 'mongoose';

export interface Irole extends Document {
  key: string;
  features: string[];
  system:boolean
}
