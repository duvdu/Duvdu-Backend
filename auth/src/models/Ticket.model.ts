import mongoose from 'mongoose';

import { Iticket } from '../types/Ticket';

const ticketSchema = new mongoose.Schema<Iticket>({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  },
  name:{
    type:String,
    trim:true
  },
  phoneNumber: { key: String, number: { type: String, unique: true, sparse: true } },
  message:String,
  state:{isClosed:Boolean , closedBy:mongoose.Schema.Types.ObjectId , feedback:String}

},{timestamps:true , toJSON:{
  transform(doc,ret){
    ret.id = ret._id;
    delete ret._id;
  }
}});

export const Ticket = mongoose.model<Iticket>('tickets' , ticketSchema);