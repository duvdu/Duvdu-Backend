import mongoose from 'mongoose';

import { Icategory } from '../types/Category';
const categorySchema = new mongoose.Schema<Icategory>({
  creativesCounter:{
    type:Number,
    default:0
  },
  title:{
    ar:String,
    en:String
  },
  image:String,
  jobTitles:{
    type:[String]
  },
  cycle:{
    type:Number,
    enum:[1,2,3,4],
    default:1
  },
  tags:{
    type:[String]
  }
},{timestamps:true , toJSON:{
  transform(doc,ret){
    ret.id = ret._id;
    delete ret._id;
  }
}});

export const Category = mongoose.model('categories' , categorySchema);