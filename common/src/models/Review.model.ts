import { CYCLES, Iuser, MODELS } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';


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
},{timestamps:true}));


export const ContractReview = model<IContractReview>(MODELS.contractReview , new Schema<IContractReview>({
  user:{type: Schema.Types.ObjectId , ref:MODELS.user},
  contract:{type:Schema.Types.ObjectId},
  cycle:{type:String , enum:CYCLES},
  rate:{type:Number , default:0},
  comment:{type:String , default:null}
},{timestamps:true}));