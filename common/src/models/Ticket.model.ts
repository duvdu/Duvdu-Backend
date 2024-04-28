import mongoose, { Schema } from 'mongoose';

import { MODELS } from '../types/model-names';
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
