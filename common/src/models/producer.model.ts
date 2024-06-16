import { model, Schema, Types } from 'mongoose';

import { Icategory } from '../types/Category';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface Iproducer{
  user : Types.ObjectId | Iuser;
  category: Types.ObjectId | Icategory;
  subCategories?: { title: { en: string; ar: string }; tags: { en: string; ar: string }[] }[];
  maxBudget:number;
  minBudget:number;
  searchKeywords:string []
}

export const Producer = model<Iproducer>(MODELS.producer , new Schema<Iproducer>({
  user:{
    type: Schema.Types.ObjectId,
    ref:MODELS.user
  },
  category:{
    type:Schema.Types.ObjectId,
    ref:MODELS.category
  },
  subCategories:[{title:{ar:{type:String , default:null} , en:{type:String , default:null}} , tags:[{en:{type:String , default:null } , ar:{type:String , default:null}}]}],
  minBudget:{type:Number , default:null},
  maxBudget:{type:Number , default:null},
  searchKeywords:[String]
},{timestamps:true , collection:MODELS.producer}));
