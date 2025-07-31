import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';

export enum PageType {
  terms = 'terms and conditions',
  privacy = 'privacy policy',
  refund = 'refund policy',
}
export interface IPage {
  title: { ar: string; en: string };
  content: { ar: string; en: string };
  type: PageType | null;
}

export const Pages = model<IPage>(
  MODELS.page,
  new Schema(
    {
      title: { ar: { type: String, default: null }, en: { type: String, default: null } },
      content: { ar: { type: String, default: null }, en: { type: String, default: null } },
      type: { type: String, enum: PageType, default: null, unique: true, sparse: true },
    },
    {
      timestamps: true,
      collection: MODELS.page,
    },
  ),
);
