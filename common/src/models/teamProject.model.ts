import { Icategory } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';

import { IprojectContract } from './projectContract.model';
import { CYCLES } from '../types/cycles';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface ITeamProject {
  user: Types.ObjectId | Iuser;
  cover: string;
  title: string;
  desc: string;
  location: { lat: number; lng: number };
  address: string;
  cycle: string;
  relatedContracts:{category:Types.ObjectId | Icategory, contracts:{contract:Types.ObjectId | IprojectContract}[]}[]
  isDeleted: boolean;
}

export const TeamProject = model<ITeamProject>(
  MODELS.teamProject,
  new Schema<ITeamProject>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      cover: { type: String, default: null },
      title: { type: String, default: null },
      desc: { type: String, default: null },
      location: { lat: { type: Number, default: null }, lng: { type: Number, default: null } },
      address: { type: String, default: null },
      relatedContracts:[{category:{type:Types.ObjectId,ref:MODELS.category}, contracts:[{contract:{type:Types.ObjectId,ref:MODELS.projectContract}}] }],
      isDeleted: { type: Boolean, default: false },
      cycle: { type: String, default: CYCLES.teamProject },
    },
    {
      timestamps: true,
      collection: MODELS.teamProject,
      toJSON: {
        transform(doc, ret) {
          if (ret.cover) ret.cover = process.env.BUCKET_HOST + '/' + ret.cover;
        },
      },
    },
  ),
);
