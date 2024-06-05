import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';


export interface IuserSession {
    user: Types.ObjectId | Iuser;
    fingerPrint:string;
    accessToken: string,
    refreshToken: string,
    userAgent:string;
    clientType:'web'|'mobile'
}


export const userSession = model<IuserSession>(MODELS.userSession , new Schema<IuserSession>({
  user:{type:Schema.Types.ObjectId , ref:MODELS.user},
  fingerPrint:{type:String , default:null},
  accessToken:{type:String , default:null},
  refreshToken:{type:String , default:null},
  userAgent:{type:String , default:null},
  clientType:{type:String , enum:['web' , 'mobile'] , default:null}
} , {timestamps:true}));