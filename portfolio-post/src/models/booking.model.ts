import { IcopyRights, Iuser, BookingState, MODELS } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';

export interface IportfolioPostBooking {
  id: string;
  sourceUser: Iuser | Types.ObjectId;
  targetUser: Iuser | Types.ObjectId;
  project: IcopyRights | Types.ObjectId;
  tools: { name: string; fees: number }[];
  creatives: { creative: Iuser | Types.ObjectId; fees: number }[];
  totalPrice: number;
  jobDetails: string;
  deadline: Date;
  location: { lat: string; lng: string };
  attachments: string[];
  address: string;
  submitFiles: { link: string; notes: string };
  state: BookingState;
  insurance: number;
  numberOfHours: number;
  appointmentDate: Date;
}

export const PortfolioPostBooking = model(MODELS.portfolioPostBooking, new Schema({}));
