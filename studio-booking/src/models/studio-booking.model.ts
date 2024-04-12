import { MODELS } from '@duvdu-v1/duvdu';
import mongoose, { model, Schema, Types } from 'mongoose';

export interface IstudioBooking {
    id: string;
    user: Types.ObjectId;
    attachments: string[];
    cover: string;
    studioName: string;
    studioNumber: string;
    studioEmail: string;
    desc: string;
    equipments: { name: string; fees: number }[];
    location: { lat: number; lng: number };
    searchKeywords: string[];
    pricePerHour: number;
    insurance: number;
    showOnHome: boolean;
    category: Types.ObjectId;
    cycle:number;
    isDeleted: boolean;
  }
  
export const studioBooking = model<IstudioBooking>(
  MODELS.studioBooking,
  new Schema({
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:MODELS.user
    },
    attachments:[String],
    cover:String,
    studioName:String,
    studioEmail:String,
    desc:String,
    equipments:[{name:String , fees:Number}],
    location:{
      lat:Number,
      lng:Number
    },
    searchKeywords:[String],
    pricePerHour:Number,
    insurance:Number,
    showOnHome:Boolean,
    category:{
      type:mongoose.Schema.Types.ObjectId,
      ref:MODELS.category
    },
    cycle:{type:Number , default:2},
    isDeleted:{type:Boolean , default:false}
  },{
    timestamps:true,
    collection:MODELS.studioBooking,
    toJSON: {
      transform(doc, ret) {
        if (ret.cover) ret.cover = process.env.BUCKET_HOST + '/' + ret.cover;
        if (ret.attachments)
          ret.attachments = ret.attachments.map(
            (el: string) => process.env.BUCKET_HOST + '/' + el,
          );
      },
    },
  })
);