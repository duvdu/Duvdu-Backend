import { Schema, Types, model } from 'mongoose';

import { generateTicketNumber } from './all-contracts.model';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface Ireport {
  ticketNumber: string;
  sourceUser: Types.ObjectId | Iuser;
  project: Types.ObjectId;
  desc: string;
  attachments: [string];
  state: { isClosed: boolean; closedBy: Types.ObjectId; feedback: string };
}

export const Report = model<Ireport>(
  MODELS.report,
  new Schema<Ireport>(
    {
      ticketNumber: { type: String, default: generateTicketNumber, unique: true, sparse: true },
      sourceUser: {
        type: Schema.Types.ObjectId,
        ref: MODELS.user,
        required: true,
      },
      project: {
        type: Schema.Types.ObjectId,
        ref: MODELS.projects,
        required: true,
      },
      desc: { type: String, default: null },
      attachments: [String],
      state: {
        isClosed: {
          type: Boolean,
          default: false,
        },
        closedBy: {
          type: Schema.Types.ObjectId,
          ref: MODELS.user,
          default: null,
        },
        feedback: { type: String, default: null },
      },
    },
    {
      timestamps: true,
      collection: MODELS.report,
      toJSON: {
        transform(doc, ret) {
          if (ret.attachments)
            ret.attachments = ret.attachments.map(
              (el: string) => process.env.BUCKET_HOST + '/' + el,
            );
        },
      },
    },
  ),
);
