import { IcopyRights, Iuser, BookingState, MODELS } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';

export interface IportfolioPostBooking {
  id: string;
  sourceUser: Iuser | Types.ObjectId;
  targetUser: Iuser | Types.ObjectId;
  project: IcopyRights | Types.ObjectId;
  tools: { name: string; fees: number }[];
  creatives: { creative: Iuser | Types.ObjectId; fees: number }[];
  attachments: string[];
  jobDetails: string;
  location: { lat: number; lng: number };
  address: string;
  customRequirements: { measure: number; unit: 'minute' | 'hour' };
  shootingDays: number;
  appointmentDate: Date;
  startDate: Date;
  submitFiles: { link: string; notes: string };
  state: BookingState;
  totalPrice: number;
  deadline: Date;
}

export const PortfolioPostBooking = model<IportfolioPostBooking>(
  MODELS.portfolioPostBooking,
  new Schema<IportfolioPostBooking>({
    sourceUser: { type: Schema.Types.ObjectId, ref: MODELS.user },
    targetUser: { type: Schema.Types.ObjectId, ref: MODELS.user },
    project: { type: Schema.Types.ObjectId, ref: MODELS.portfolioPost },
    tools: [{ name: { type: String, required: true }, fees: { type: Number, required: true } }],
    creatives: [
      {
        creative: { type: Schema.Types.ObjectId, ref: MODELS.user },
        fees: { type: Number, required: true },
      },
    ],
    attachments: [String],
    location: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    address: { type: String, default: null },
    jobDetails: { type: String, default: null },
    customRequirements: {
      measure: { type: Number, default: 0 },
      unit: { type: String, enum: ['minute', 'hour'] },
    },
    shootingDays: Number,
    appointmentDate: { type: Date },
    startDate: { type: Date },
    submitFiles: { link: { type: String, default: null }, notes: { type: String, default: null } },
    state: { type: String, enum: BookingState, default: BookingState.pending },
    totalPrice: { type: Number, required: true },
    deadline: Date,
  }),
);
