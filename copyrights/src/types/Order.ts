import { Types, Document } from 'mongoose';

export interface Iorder extends Document {
  id: string;
  sourceUser: Types.ObjectId;
  targetUser: Types.ObjectId;
  jobDetails: string;
  appointmentDate: Date;
  location: { lat: string; lng: string };
  attachments: string[];
  status: 'canceled' | 'pending' | 'paid';
  totalAmount: number;
}
