import { MODELS , Iuser } from '@duvdu-v1/duvdu';
import  { model, Schema , Types } from 'mongoose';


interface Ireaction {
  type: string;
  user: Types.ObjectId | Iuser;
}

export interface ImessageDoc {
    sender: Types.ObjectId | Iuser;
    receiver: Types.ObjectId | Iuser;
    content?: string;
    media?: {
      type: string; 
      url: string;
    };
    reactions: Ireaction[];
    watched: boolean;
  }

const reactionSchema = new Schema({
  type: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: MODELS.user, required: true },
});

export const Message = model<ImessageDoc>('Messages' , new Schema<ImessageDoc>({
  sender:{
    type:Schema.Types.ObjectId,
    ref:MODELS.user,
    required:true
  },
  receiver:{
    type:Schema.Types.ObjectId,
    ref:MODELS.user,
    required:true
  },
  content:{
    type:String,
    default:null
  },
  reactions:[reactionSchema],
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio' , 'pdf'],
    },
    url: String,
  },
  watched:{
    type:Boolean,
    default:false
  }
},{timestamps:true , collection:'Messages' , toJSON: {
  transform(doc, ret) {
    if (ret.media.url) ret.media.url = process.env.BUCKET_HOST + '/' + ret.media.url;
  }
}
}));