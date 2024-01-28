import { Document } from 'mongoose';

export interface Icategory extends Document {
  id: string;
  title: string;
  image: string;
}
