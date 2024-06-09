import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';



export interface Irank {
    actionCount:number;
    rank:string;
}


export const Rank = model<Irank>(MODELS.rank , new Schema<Irank>({
  actionCount:{type:Number , default:0},
  rank:{type:String , default:null}
} , {timestamps:true , collection:MODELS.rank}));