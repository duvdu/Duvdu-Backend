import mongoose from 'mongoose';

import { Irole } from '../types/role';

const roleSchema = new mongoose.Schema<Irole>({
  key:{
    type:String,
    unique:true
  },
  features:[String]
},{timestamps:true , toJSON:{
  transform(doc,ret){
    ret.id = ret._id;
    delete ret._id;
  }
}});

export const Role = mongoose.model<Irole>('roles' , roleSchema);