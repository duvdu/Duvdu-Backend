import { MODELS, Iuser } from '@duvdu-v1/duvdu';
import { Schema, model, Types } from 'mongoose';

export interface IequipmentRental {
  id: string;
  user: Types.ObjectId | Iuser;
  attachments: string[];
  cover: string;
  title: string;
  desc: string;
  address: string;
  tools: { name: string; fees: number }[];
  canChangeAddress: boolean;
  searchKeywords: string[];
  pricePerHour: number;
  insurance: number;
  showOnHome: boolean;
  cycle: number;
  category: Types.ObjectId;
  tags: string[];
  isDeleted: boolean;
}

export const EquipmentRentals = model<IequipmentRental>(
  'equipment-rental',
  new Schema<IequipmentRental>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      attachments: [String],
      cover: String,
      title: String,
      desc: String,
      address: String,
      tools: [{ name: String, fees: Number }],
      canChangeAddress: Boolean,
      searchKeywords: [String],
      pricePerHour: Number,
      insurance: Number,
      showOnHome: Boolean,
      cycle: { type: Number, default: 1 },
      category: { type: Schema.Types.ObjectId, ref: MODELS.category },
      tags: [String],
      isDeleted: { type: Boolean, default: false },
    },
    {
      timestamps: true,
      collection: 'equipment-rental',
      toJSON: {
        transform(doc, ret) {
          if (ret.cover) ret.cover = process.env.BUCKET_HOST + '/' + ret.cover;
          if (ret.attachments)
            ret.attachments = ret.attachments.map(
              (el: string) => process.env.BUCKET_HOST + '/' + el,
            );
        },
      },
    },
  )
    .index({ createdAt: 1, updatedAt: -1 })
    .index({ title: 'text', desc: 'text', tools: 'text', searchKeywords: 'text' }),
);
