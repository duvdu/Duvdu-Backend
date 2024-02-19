import mongoose from 'mongoose';

import { Iplan } from '../types/plan';

const planSchema = new mongoose.Schema<Iplan>({
  role:{
    type:mongoose.Schema.Types.ObjectId
  }
},{timestamps:true , toJSON:{
  transform(doc,ret){
    ret.id = ret._id;
    delete ret._id;
  }
}});

export const Plan = mongoose.model<Iplan>('plans' , planSchema);