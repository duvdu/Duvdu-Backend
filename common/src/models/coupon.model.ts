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
    value:number,
    percentage:number,
    users:{user:Types.ObjectId | Iuser , count:number }[]
    expired:boolean
}


export const Coupon = model<ICoupon>(MODELS.coupon , new Schema<ICoupon>({
  title:{en:{type:String , default:null} , ar:{type:String , default:null}},
  promoCode:{type:String , unique:true , sparse:true},
  users:[{user:{type:Schema.Types.ObjectId , ref: MODELS.user} , count:{type:Number , default:0}}],
  couponCount:{type:Number , default:1},
  userCount:{type:Number , default:1},
  value:{type:Number , default:null},
  percentage:{type:Number , default:null},
  expired:{type:Boolean , default:false},
  start:Date,
  end:Date
},{timestamps:true , collection:MODELS.coupon}));