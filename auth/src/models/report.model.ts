import { Iproject, Iuser, MODELS } from '@duvdu-v1/duvdu';
import { Schema , Types, model } from 'mongoose';



export interface Ireport {
    sourceUser: Types.ObjectId | Iuser;
    targetUser: Types.ObjectId | Iuser;
    project: Types.ObjectId | Iproject;
    desc: string;
    attachments: [string];
    state: { isClosed: boolean; closedBy: Types.ObjectId; feedback: string };
}

export const Report = model<Ireport>('report' , new Schema<Ireport>({
  sourceUser:{
    type:Schema.Types.ObjectId,
    ref:MODELS.user
  },
  targetUser:{
    type:Schema.Types.ObjectId,
    ref:MODELS.user
  },
  project:{
    type:Schema.Types.ObjectId,
  },
  desc:String,
  attachments:[String],
  state:{
    isClosed:{
      type:Boolean,
      default:false
    },
    closedBy:{
      type:Schema.Types.ObjectId,
      ref:MODELS.user
    },
    feedback:String
  }
} , {timestamps:true , collection:'report' , toJSON: {
  transform(doc, ret) {
    if (ret.attachments)
      ret.attachments = ret.attachments.map(
        (el: string) => process.env.BUCKET_HOST + '/' + el,
      );
  },
},}));