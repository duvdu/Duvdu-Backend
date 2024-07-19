import { model, Schema, Types } from 'mongoose';

import { MODELS } from './../types/model-names';
import { CYCLES } from '../types/cycles';
import { Iuser } from '../types/User';
export interface IContractReview {
    sp:Types.ObjectId | Iuser;
    customer: Types.ObjectId | Iuser;
    contract: Types.ObjectId;
    cycle :CYCLES,
    rate:number;
    comment:string;
}


export const ContractReview = model<IContractReview>(MODELS.contractReview , new Schema<IContractReview>({
  sp:{type: Schema.Types.ObjectId , ref:MODELS.user},
  customer:{type: Schema.Types.ObjectId , ref:MODELS.user},
  contract:{type:Schema.Types.ObjectId},
  cycle:{type:String , enum:CYCLES},
  rate:{type:Number , default:0},
  comment:{type:String , default:null}
},{timestamps:true , collection:MODELS.contractReview}));