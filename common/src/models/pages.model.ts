import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';

export interface IPage {
  title: { ar: string; en: string };
  content: { ar: string; en: string };
}

export const Pages = model<IPage>(
  MODELS.page,
  new Schema(
    {
      title: { ar: { type: String, default: null }, en: { type: String, default: null } },
      content: { ar: { type: String, default: null }, en: { type: String, default: null } },
    },
    {
      timestamps: true,
      collection: MODELS.page,
    },
  ),
);
