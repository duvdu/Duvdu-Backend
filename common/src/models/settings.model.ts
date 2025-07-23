import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';

export interface Isetting {
  expirationTime: { time: number }[];
  contractSubscriptionPercentage: number;
  default_profile: string;
  default_cover: string;
  splash: {
    cover: string;
    title: string;
    subTitle: string;
  }[];
}


export const Setting = model<Isetting>(
  MODELS.setting,
  new Schema<Isetting>(
    {
      expirationTime: [{ time: { type: Number, unique: true } }],
      default_profile: String,
      default_cover: String,
      contractSubscriptionPercentage: { type: Number, default: 10 },
      splash: [
        {
          cover: { type: String, default: null },
          title: { type: String, default: null },
          subTitle: { type: String, default: null },
        },
      ],
    },
    { timestamps: true, collection: MODELS.setting , toJSON: { transform: (doc, ret) => {
      if (ret.default_profile) {
        ret.default_profile = `${process.env.BUCKET_HOST}/${ret.default_profile}`;
      }
      if (ret.default_cover) {
        ret.default_cover = `${process.env.BUCKET_HOST}/${ret.default_cover}`;
      }
    } } },
  ),
);
