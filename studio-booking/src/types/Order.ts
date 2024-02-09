import { Types, Document } from 'mongoose';

export interface Iorder extends Document {
  id: string;
  sourceUser: Types.ObjectId;
  targetUser: Types.ObjectId;
  projectId: Types.ObjectId;
  projectDetails: string;
  equipments: { name: string; fees: number }[];
  insurrance: number;
  numberOfHours: number;
  appointmentDate: Date;
  isInstant: boolean;
  status: 'canceled' | 'pending' | 'paid';
  location: { lat: string; lng: string };
  totalAmount: number;
}
