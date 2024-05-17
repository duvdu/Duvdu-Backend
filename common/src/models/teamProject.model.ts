import { Document, model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';

export interface IteamProject extends Document {
  user:Types.ObjectId;
  cover: string;
  title: string;
  category: Types.ObjectId;
  budget: number;
  desc: string;
  location: { lat: number; lng: number };
  address:string;
  attachments: string[];
  shootingDays: number;
  startDate: Date;
  status: 'pending' | 'completed';
  creatives: [
    {
      jobTitle: string;
      users: [
        {
          user: Types.ObjectId;
          workHours: number;
          totalAmount: number;
          status: 'pending' | 'rejected' | 'accepted';
        }
      ];
    }
  ];
  isDeleted:boolean;
  showOnHome: boolean;
}

const UserSchema = new Schema<IteamProject['creatives'][0]['users'][0]>({
  user: {
    type: Schema.Types.ObjectId,
    ref: MODELS.user,
    required:true
  },
  workHours: {
    type: Number,
    required: true,
    default:null
  },
  totalAmount: {
    type: Number,
    required: true,
    default:null
  },
  status: {
    type: String,
    enum: ['pending', 'rejected', 'accepted'],
    required: true,
    default:'pending'
  }
});


const CreativeSchema = new Schema<IteamProject['creatives'][0]>({
  jobTitle: {
    type: String,
    required: true,
    default:null
  },
  users: [UserSchema]
});

export const TeamProject = model<IteamProject>(MODELS.teamProject , new Schema<IteamProject>({
  user:{
    type:Schema.Types.ObjectId,
    ref:MODELS.user
  },
  cover:{
    type:String,
    default:null
  },
  title:{
    type:String,
    default:null
  },
  category:{
    type: Schema.Types.ObjectId,
    ref:MODELS.category
  },
  budget:{
    type:Number,
    default:null
  },
  desc:{
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
  },
  address:{
    type:String,
    default:null
  },
  attachments:{
    type:[String],
    default:null
  },
  shootingDays:{
    type:Number,
    default:null
  },
  startDate:{
    type:Date,
    default:null
  },
  status:{
    type:String,
    enum:['pending' , 'completed'],
    default:'pending'
  },
  creatives: [CreativeSchema],
  isDeleted:{
    type:Boolean,
    default:false
  },
  showOnHome:{
    type:Boolean,
    default:true
  }
} , {timestamps:true , collection:MODELS.teamProject , 
  toJSON: {
    transform(doc, ret) {
      if (ret.cover) ret.cover = process.env.BUCKET_HOST + '/' + ret.cover;
      if (ret.attachments)
        ret.attachments = ret.attachments.map(
          (el: string) => process.env.BUCKET_HOST + '/' + el,
        );
    },
  }
}
));


