import { Schema, model } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

const userSchema = new Schema<Iuser>(
  {
    googleId: { type: String, default: null },
    appleId: { type: String, default: null },
    name: { type: String, default: null },
    phoneNumber: {
      key: { type: String, default: null },
      number: { type: String, unique: true, default: null, sparse: true },
    },
    username: { type: String, unique: true, sparce: true, default: null },
    password: String,
    verificationCode: { code: String, expireAt: Date, reason: { type: String, default: null } },
    isVerified: { type: Boolean, default: false },
    token: String,
    profileImage: { type: String, default: null },
    coverImage: { type: String, default: null },
    location: { lat: { type: Number, default: null }, lng: { type: Number, default: null } },
    category: { type: Schema.Types.ObjectId, ref: MODELS.category },
    acceptedProjectsCounter: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    about: { type: String, default: null },
    isOnline: { type: Boolean, default: false },
    isAvaliableToInstantProjects: { type: Boolean, default: false },
    pricePerHour: { type: Number, default: 0 },
    role: { type: Schema.Types.ObjectId, ref: MODELS.role },
    hasVerificationBadge: { type: Boolean, default: false },
    avaliableContracts: { type: Number, default: 0 },
    rate: { ratersCounter: { type: Number, default: 0 }, totalRates: { type: Number, default: 0 } },
    isBlocked: {
      value: { type: Boolean, default: false },
      reason: { type: String, default: null },
    },
  },
  { timestamps: true,
    collection: MODELS.user,
    toJSON: {
      transform(doc, ret) {
        if (ret.coverImage) ret.coverImage = process.env.BUCKET_HOST + '/' + ret.coverImage;
        if (ret.profileImage) ret.profileImage = process.env.BUCKET_HOST + '/' + ret.profileImage;
      },
    }, },
);

export const Users = model<Iuser>(MODELS.user, userSchema);
