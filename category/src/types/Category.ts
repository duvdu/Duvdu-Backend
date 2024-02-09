import { Document } from 'mongoose';

export interface Icategory extends Document {
  id: string;
  creativesCounter: number;
  title: { ar: string; en: string };
  image: string;
  tags?: string[];
  jobTitles?: string[];
  cycle: 1 | 2 | 3 | 4;
}
