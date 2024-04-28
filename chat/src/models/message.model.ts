import { MODELS } from '@duvdu-v1/duvdu';
import  { model, Schema , Types } from 'mongoose';


interface Ireaction {
  type: string;
  user: Types.ObjectId;
}

interface ImessageDoc {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    content?: string;
    media?: {
      type: string; 
      url: string;
    };
    reactions: Ireaction[];
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
      enum: ['image', 'video', 'audio'],
    },
    url: String,
  }

},{timestamps:true , collection:'Messages'}));