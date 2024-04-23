import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';


interface Iproject {
    project: {
        type: Schema.Types.ObjectId;
      };
      ref: string;
}


export const Project = model<Iproject>(MODELS.projects , new Schema<Iproject>({
  project: {
    type: {
      type: Schema.Types.ObjectId,
      refPath: 'project.ref' // Dynamic reference based on project.ref field
    },
    ref: String
  },
  ref: String
},{timestamps:true , collection:MODELS.projects}));