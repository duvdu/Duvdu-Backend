import { model, Schema, Types } from 'mongoose';

import { BookingState } from '../types/booking-states';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface IstudioBookingBook {
  id: string;
  sourceUser: Iuser | Types.ObjectId;
  targetUser: Iuser | Types.ObjectId;
  project: Types.ObjectId;
  jobDetails: string;
  equipments: { name: string; fees: number }[];
  address: string;
  location: { lat: string; lng: string };
  bookingHours: number;
  appointmentDate: Date;
  insurance: number;
  deadline: Date;
  totalPrice: number;
  state: BookingState;
  qrToken: string;
  paymentSession: string;
}

export const StudioBookingBook = model<IstudioBookingBook>(
  MODELS.studioBookingBook,
  new Schema<IstudioBookingBook>({
    sourceUser: { type: Schema.Types.ObjectId, ref: MODELS.user },
    targetUser: { type: Schema.Types.ObjectId, ref: MODELS.user },
    project: { type: Schema.Types.ObjectId, ref: MODELS.studioBooking },
    jobDetails: { type: String, default: null },
    equipments: [
      { name: { type: String, required: true }, fees: { type: Number, required: true } },
    ],
    address: { type: String, default: null },
    location: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    bookingHours: { type: Number, required: true },
    appointmentDate: { type: Date, required: true },
    insurance: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    state: { type: String, enum: BookingState, default: BookingState.unpaid },
    qrToken: { type: String },
    paymentSession: String,
  }),
);
