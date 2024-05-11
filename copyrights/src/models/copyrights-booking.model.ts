import { IcopyRights, Iuser, MODELS, BookingState } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';

export interface IcopyrightsBooking {
  id: string;
  sourceUser: Iuser | Types.ObjectId;
  targetUser: Iuser | Types.ObjectId;
  project: IcopyRights | Types.ObjectId;
  jobDetails: string;
  deadline: Date;
  location: { lat: string; lng: string };
  attachments: string[];
  address: string;
  submitFiles: { link: string; notes: string };
  state: BookingState;
}

export const CopyrightsBooking = model<IcopyrightsBooking>(
  MODELS.copyrightsBooking,
  new Schema<IcopyrightsBooking>(
    {
      sourceUser: { type: Schema.Types.ObjectId, ref: MODELS.user, required: true },
      targetUser: { type: Schema.Types.ObjectId, ref: MODELS.user, required: true },
      project: { type: Schema.Types.ObjectId, ref: MODELS.user, required: true },
      jobDetails: { type: String, default: null },
      deadline: { type: Date, required: true },
      address: { type: String, default: null },
      location: { lat: { type: String, required: true }, lng: { type: String, required: true } },
      attachments: [String],
      submitFiles: {
        link: { type: String, default: null },
        notes: { type: String, default: null },
      },
      state: { type: String, enum: BookingState, default: BookingState.pending, required: true },
    },
    {
      timestamps: true,
      collection: MODELS.copyrightsBooking,
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
