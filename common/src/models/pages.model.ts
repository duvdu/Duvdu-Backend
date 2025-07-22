import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';

export interface IPage {
  title: string;
  content: string;
}

export const Pages = model<IPage>(
  MODELS.page,
  new Schema(
    {
      title: { type: String, default: null },
      content: { type: String, default: null },
    },
    {
      timestamps: true,
      collection: MODELS.page,
    },
  ),
);
