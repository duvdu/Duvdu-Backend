import { model, Schema, Types } from 'mongoose';

import { MODELS } from './../types/model-names';
import { CYCLES } from '../types/cycles';
import { Iuser } from '../types/User';


export interface IProjectReview {
    user:Types.ObjectId | Iuser;
    project: Types.ObjectId;
    cycle :CYCLES,
    rate:number;
    comment:string;
}

export interface IContractReview {
    user:Types.ObjectId | Iuser;
    contract: Types.ObjectId;
    cycle :CYCLES,
    rate:number;
    comment:string;
}



export const ProjectReview = model<IProjectReview>(MODELS.projectReview , new Schema<IProjectReview>({
  user:{type: Schema.Types.ObjectId , ref:MODELS.user},
  project:{type:Schema.Types.ObjectId},
  cycle:{type:String , enum:CYCLES},
  rate:{type:Number , default:0},
  comment:{type:String , default:null}
},{timestamps:true , collection:MODELS.projectReview}));


export const ContractReview = model<IContractReview>(MODELS.contractReview , new Schema<IContractReview>({
  user:{type: Schema.Types.ObjectId , ref:MODELS.user},
  contract:{type:Schema.Types.ObjectId},
  cycle:{type:String , enum:CYCLES},
  rate:{type:Number , default:0},
  comment:{type:String , default:null}
},{timestamps:true , collection:MODELS.contractReview}));