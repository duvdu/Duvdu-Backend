import { model, Schema, Types } from 'mongoose';

import { CYCLES } from '../types/cycles';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

export interface Iproducer{
    user : Types.ObjectId | Iuser
}

export interface IproducerBooking{
    producer:Types.ObjectId | Iuser;
    user:Types.ObjectId | Iuser;
    platform:string;
    details:string;
    cycle:string;
    episodes:number;
    episodeduration:number;
    attachments:string[];
    expectedbudget:number;
    expectedprofits:number;
    status: 'pending' | 'accepted' | 'rejected' | 'appoinment pending' | 'appoinment accepted' | 'appoinment rejected';
    appoinment:{
        date:string;
        address:string;
        location:{lat:number , lng:number}
    }
}

export const ProducerBooking = model<IproducerBooking>(MODELS.producerBooking , new Schema<IproducerBooking>({
  producer:{
    type:Schema.Types.ObjectId,
    ref:MODELS.user
  },
  user:{
    type:Schema.Types.ObjectId,
    ref:MODELS.user
  },
  platform:{
    type:String,
    default:null
  },
  details:{
    type:String,
    default:null
  },
  cycle:{
    type:String,
    default:CYCLES.producer
  },
  episodes:{
    type:Number,
    default:null
  },
  episodeduration:{
    type:Number,
    default:null
  },
  attachments:[String],
  expectedbudget:{
    type:Number,
    default:null
  },
  expectedprofits:{
    type:Number,
    default:null
  },
  status:{
    type:String,
    enum:['pending' , 'accepted' , 'rejected' , 'appoinment pending' , 'appoinment accepted' , 'appoinment rejected'],
    default:'pending'
  },
  appoinment:{
    date:{
      type:String,
      default:null
    },
    address:{
      type:String,
      default:null
    },
    location:{
      lat:{
        type:Number,
        default:null
      },
      lng:{
        type:Number,
        default:null
      }
    }
  }
} , {timestamps:true , collection:MODELS.producerBooking , toJSON:{
  transform(doc, ret) {
    if (ret.attachments)
      ret.attachments = ret.attachments.map(
        (el: string) => process.env.BUCKET_HOST + '/' + el,
      );
  },
}}));



export const Producer = model<Iproducer>(MODELS.producer , new Schema<Iproducer>({
  user:{
    type: Schema.Types.ObjectId,
    ref:MODELS.user
  }
},{timestamps:true , collection:MODELS.producer}));
