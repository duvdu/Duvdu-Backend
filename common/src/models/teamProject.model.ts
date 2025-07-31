import { model, Schema, Types } from 'mongoose';

import { IprojectContract } from './projectContract.model';
import { Icategory } from '../types/Category';
import { CYCLES } from '../types/cycles';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

const generateTicketNumber = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `TPT${random}`;
};

export interface ITeamProject {
  user: Types.ObjectId | Iuser;
  ticketNumber: string;
  cover: string;
  title: string;
  desc: string;
  location: { lat: number; lng: number };
  address: string;
  cycle: string;
  relatedContracts: {
    category: Types.ObjectId | Icategory;
    contracts: { contract: Types.ObjectId | IprojectContract }[];
  }[];
  isDeleted: boolean;
}

export const TeamProject = model<ITeamProject>(
  MODELS.teamProject,
  new Schema<ITeamProject>(
    {
      user: { type: Schema.Types.ObjectId, ref: MODELS.user },
      ticketNumber: { type: String, default: generateTicketNumber, unique: true, sparse: true },
      cover: { type: String, default: null },
      title: { type: String, default: null },
      desc: { type: String, default: null },
      location: { lat: { type: Number, default: null }, lng: { type: Number, default: null } },
      address: { type: String, default: null },
      relatedContracts: [
        {
          category: { type: Types.ObjectId, ref: MODELS.category },
          contracts: [{ contract: { type: Types.ObjectId, ref: MODELS.projectContract } }],
        },
      ],
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
