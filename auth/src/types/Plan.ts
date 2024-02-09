import { Document } from 'mongoose';

export interface Iplan extends Document {
  id: string;
  title: { ar: string; en: string };
  key: string;
  role: string;
  status: boolean;
}
