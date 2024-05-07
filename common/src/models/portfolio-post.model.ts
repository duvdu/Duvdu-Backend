import { Schema, model, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface IportfolioPost {
  id: string;
  user: Types.ObjectId;
  attachments: string[];
  cover: string;
  title: string;
  desc: string;
  address: string;
  tools: { name: string; fees: number }[];
  searchKeywords: string[];
  creatives: { creative: Types.ObjectId | Iuser; fees: number }[];
  tags: {ar:string , en:string}[];
  subCategory:{ar:string , en:string};
  projectBudget: number;
  category: Types.ObjectId;
  projectScale: { scale: number; time: 'minutes' | 'hours' };
  showOnHome: boolean;
  cycle: number;
  rate: { ratersCounter: number; totalRates: number };
  isDeleted: boolean;
}


export const PortfolioPosts = model<IportfolioPost>(
  MODELS.portfolioPost,
  new Schema<IportfolioPost>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      attachments: [String],
      cover: { type: String, default: null },
      title: { type: String, default: null },
      desc: { type: String, default: null },
      address: { type: String, default: null },
      tools: [{ name: { type: String, default: null }, fees: { type: Number, default: 0 } }],
      searchKeywords: [String],
      creatives: [
        {
          creative: { type: Schema.Types.ObjectId, ref: MODELS.user },
          fees: { type: Number, default: null },
        },
      ],
      tags:[{ ar: { type: String, default: null }, en: { type: String, default: null } }],
      subCategory:{
        ar:String,
        en:String
      },
      projectBudget: { type: Number, default: null },
      category: { type: Schema.Types.ObjectId, ref: MODELS.category, required: true },
      projectScale: { scale: { type: Number, default: 0 }, time: { type: String, default: null } },
      showOnHome: { type: Boolean, default: true },
      cycle: { type: Number, default: 1 },
      isDeleted: { type: Boolean, default: false },
      rate: {
        ratersCounter: { type: Number, default: 0 },
        totalRates: { type: Number, default: 0 },
      },
    },
    {
      timestamps: true,
      collection: MODELS.portfolioPost,
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

PortfolioPosts.schema.set('toJSON', {
  transform: function (doc, ret) {
    if (ret.cover) {
      ret.cover = process.env.BUCKET_HOST + '/' + ret.cover;
    }
    if (ret.attachments) {
      ret.attachments = ret.attachments.map((el: string) => process.env.BUCKET_HOST + '/' + el);
    }
    return ret;
  }
});
