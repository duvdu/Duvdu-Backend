import { Types, ObjectId } from 'mongoose';

export interface Iorder {
  id: string;
  sourceUser: Types.ObjectId;
  targetUser: Types.ObjectId;
  projectId: Types.ObjectId;
  projectDetails: string;
  location: { lat: string; lng: string };
  attachments: string[];
  customRequirement: string;
  shootingDays: number;
  appointmentDate: Date;
  deadline: Date;
  projectDate: Date;
  isInstant: boolean;
  totalAmount: number;
  state: 'canceled' | 'pending' | 'paid';
  submitFiles: { link: string; notes: string };
}
