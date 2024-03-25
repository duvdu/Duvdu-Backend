import { MODELS } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { Iticket } from '../types/Ticket';

const ticketSchema = new mongoose.Schema<Iticket>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.user,
    },
    name: {
      type: String,
      trim: true,
    },
    phoneNumber: { key: String, number: { type: String, unique: true, sparse: true } },
    message: String,
    state: {
      isClosed: { type: Boolean, default: false },
      closedBy: mongoose.Schema.Types.ObjectId,
      feedback: String,
    },
  },
  {
    collection: MODELS.ticket,
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

export const Ticket = mongoose.model<Iticket>(MODELS.ticket, ticketSchema);
