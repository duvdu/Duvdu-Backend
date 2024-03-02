import { Schema, model } from 'mongoose';

import { Iuser } from '../types/User';

const userSchema = new Schema<Iuser>(
  {
    googleId: String,
    appleId: String,
    name: String,
    phoneNumber: { key: String, number: { type: String, unique: true, sparse: true } },
    username: { type: String, unique: true },
    password: String,
    verificationCode: { code: String, expireAt: Date },
    isVerified: { type: Boolean, default: false },
    token: String,
    profileImage: String,
    coverImage: String,
    location: { lat: Number, lng: Number },
    category: { type: Schema.Types.ObjectId, ref: 'category' },
    acceptedProjectsCounter: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    about: String,
    isOnline: { type: Boolean, default: false },
    isAvaliableToInstantProjects: { type: Boolean, default: false },
    pricePerHour: { type: Number, default: 0 },
    plan: { type: Schema.Types.ObjectId, ref: 'plan' },
    hasVerificationPadge: { type: Boolean, default: false },
    avaliableContracts: { type: Number, default: 0 },
    rate: { ratersCounter: { type: Number, default: 0 }, totalRates: { type: Number, default: 0 } },
    isBlocked: { type: Boolean, default: false },
    status: { value: { type: Boolean, default: true }, reason: String },
  },
  { timestamps: true, collection: 'user' },
);

export const Users = model<Iuser>('user', userSchema);
