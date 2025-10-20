// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import mongoose, { Schema } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iticket } from '../types/Ticket';

const generateTicketNumber = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `TKT${random}`;
};

const ticketSchema = new mongoose.Schema<Iticket>(
  {
    ticketNumber: { type: String, default: generateTicketNumber, unique: true, sparse: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.user,
    },
    name: {
      type: String,
      trim: true,
      default: null,
    },
    phoneNumber: {
      key: { type: String, default: null },
      number: { type: String, default: null },
    },
    message: { type: String, default: null },
    state: {
      isClosed: { type: Boolean, default: false },
      closedBy: { type: Schema.Types.ObjectId, ref: MODELS.user },
      feedback: { type: String, default: null },
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
