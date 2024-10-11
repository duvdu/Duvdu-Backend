import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

interface Ireaction {
  type: string;
  user: Types.ObjectId | Iuser;
}

export interface IWatcher {
  user: Types.ObjectId | Iuser;
  watched: boolean;
}

export interface ImessageDoc {
  sender: Types.ObjectId | Iuser;
  receiver: Types.ObjectId | Iuser;
  content?: string;
  media?: [
    {
      type: string;
      url: string;
    },
  ];
  reactions: Ireaction[];
  updated: boolean;
  watchers: IWatcher[];
}

const reactionSchema = new Schema<Ireaction>({
  type: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: MODELS.user, required: true },
});

const watcherSchema = new Schema<IWatcher>({
  user: { type: Schema.Types.ObjectId, ref: MODELS.user, required: true },
  watched: { type: Boolean, default: false },
});

export const Message = model<ImessageDoc>(
  MODELS.messages,
  new Schema<ImessageDoc>(
    {
      sender: {
        type: Schema.Types.ObjectId,
        ref: MODELS.user,
        required: true,
      },
      receiver: {
        type: Schema.Types.ObjectId,
        ref: MODELS.user,
        required: true,
      },
      content: {
        type: String,
        default: null,
      },
      reactions: [reactionSchema],
      watchers: [watcherSchema],
      media: [
        {
          type: {
            type: String,
            default: null,
          },
          url: {
            type: String,
            default: null,
          },
        },
      ],
      updated: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
      collection: MODELS.messages,
      toJSON: {
        transform(doc, ret) {
          if (ret.media?.url) ret.media.url = process.env.BUCKET_HOST + '/' + ret.media.url;
        },
      },
    },
  ),
);

Message.schema.set('toJSON', {
  transform: function (doc, ret) {
    if (ret.media?.url) {
      ret.media.url = process.env.BUCKET_HOST + '/' + ret.media.url;
    }
    return ret;
  },
});
