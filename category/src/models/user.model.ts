import mongoose from 'mongoose';

import { Iuser } from '../types/user';

const userSchema = new mongoose.Schema<Iuser>(
  {
    isVerified: {
      value:{
        type:Boolean,
        default:false
      },
      reason:String
    },
    token: String,
    isBlocked: { type: Boolean, default: false },
    status: { value: { type: Boolean, default: false }, reason: String },
    role: { type: mongoose.Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    collection: 'user'
  },
);


export const User = mongoose.model<Iuser>('user', userSchema);
