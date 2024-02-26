import mongoose from 'mongoose';

import { Iuser } from '../types/user';

const userSchema = new mongoose.Schema<Iuser>(
  {
    isVerified: { type: Boolean, default: false },
    token: String,
    isBlocked: { type: Boolean, default: false },
    status: { value: { type: Boolean, default: true }, reason: String },
    plan: { type: mongoose.Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

export const User = mongoose.model<Iuser>('users', userSchema);
