import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';



export interface ICoupon {
    title:{en:string , ar:string},
    promoCode:string,
    start:Date,
    end:Date,
    couponCount:number,
    userCount:number,
    users:{user:Types.ObjectId | Iuser , count:number }[]
}


export const Coupon = model<ICoupon>(MODELS.coupon , new Schema<ICoupon>({
  title:{en:{type:String , default:null} , ar:{type:String , default:null}},
  promoCode:{type:String , unique:true , sparse:true},
  users:[{user:{type:Schema.Types.ObjectId , ref: MODELS.user} , count:{type:Number , default:0}}],
  couponCount:{type:Number , default:1},
  userCount:{type:Number , default:1},
  start:Date,
  end:Date
},{timestamps:true , collection:MODELS.coupon}));