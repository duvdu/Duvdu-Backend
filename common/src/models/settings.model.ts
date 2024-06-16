import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';




export interface Isetting {
    expirationTime:{time:number}[]
}


export const Setting = model<Isetting>(MODELS.setting , new Schema<Isetting>({
  expirationTime:[{time:Number , unique:true}]
},{timestamps:true , collection:MODELS.setting}));