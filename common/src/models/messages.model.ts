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
          // Handle media array - transform URLs for each media item
          if (ret.media && Array.isArray(ret.media)) {
            ret.media = ret.media.map(mediaItem => {
              if (mediaItem?.url) {
                return {
                  ...mediaItem,
                  url: process.env.BUCKET_HOST + '/' + mediaItem.url
                };
              }
              return mediaItem;
            });
          }
          return ret;
        },
      },
    },
  ),
);
