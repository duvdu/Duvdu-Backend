import { Document, Types } from 'mongoose';

export interface Iproject extends Document {
  cover: string;
  title: string;
  category: Types.ObjectId;
  budget: number;
  desc: string;
  location: { lat: number; lng: number };
  attachments: string[];
  shootingDays: number;
  startDate: Date;
  status: 'pending' | 'completed';
  creatives: [
    {
      jobTitle: string;
      users: [
        {
          userId: Types.ObjectId;
          workHours: number;
          totalAmount: number;
          status: 'pending' | 'rejected' | 'accepted';
        }
      ];
    }
  ];
}
