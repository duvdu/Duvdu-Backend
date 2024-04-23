import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';


interface Iproject {
    project: {
        type: Schema.Types.ObjectId;
        ref: string;
      };
}


export const Project = model<Iproject>(MODELS.projects , new Schema<Iproject>({
  project:{
    type:{
      type:Schema.Types.ObjectId,
      ref:'Any'
    },
    ref:String
  }
},{timestamps:true , collection:MODELS.projects}));