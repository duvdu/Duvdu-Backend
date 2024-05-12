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
  location: { lat: number; lng: number };
  attachments: string[];
  address: string;
  submitFiles: { link: string; notes: string };
  state: BookingState;
  numberOfHours: number;
  appointmentDate: Date;
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
    totalPrice: { type: Number, required: true },
    jobDetails: { type: String, default: null },
    deadline: Date,
    location: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    attachments: [String],
    address: { type: String, default: null },
    submitFiles: { link: { type: String, default: null }, notes: { type: String, default: null } },
    state: { type: String, enum: BookingState, default: BookingState.pending },
    numberOfHours: { type: Number },
    appointmentDate: Date,
  }),
);
