import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';

export interface IProducerPlatform {
  name: { ar: string; en: string };
  image: string;
}

export const ProducerPlatform = model<IProducerPlatform>(
  MODELS.producerPlatforms,
  new Schema<IProducerPlatform>(
    {
      name: { ar: { type: String, default: null }, en: { type: String, default: null } },
      image: String,
    },
    {
      timestamps: true,
      collection: MODELS.producerPlatforms,
      toJSON: {
        transform(doc, ret) {
          if (ret.image) ret.image = process.env.BUCKET_HOST + '/' + ret.image;
        },
      },
    },
  ),
);
