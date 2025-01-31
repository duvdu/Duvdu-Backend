import { Schema, model } from 'mongoose';

import { updateRankForUser, UserDocument } from '../services/rank.service';
import { MODELS } from '../types/model-names';
import { Iuser } from '../types/User';

const userSchema = new Schema<Iuser>(
  {
    googleId: { type: String, default: null },
    appleId: { type: String, default: null },
    email: { type: String, unique: true, sparse: true },
    name: { type: String, default: null },
    phoneNumber: {
      key: { type: String, default: null },
      number: { type: String, unique: true, sparse: true },
    },
    username: { type: String, unique: true, sparse: true },
    password: String,
    verificationCode: { code: String, expireAt: Date, reason: { type: String, default: null } },
    isVerified: { type: Boolean, default: false },
    refreshTokens: [
      {
        token: { type: String, default: null },
        deviceId: { type: String, default: null },
      },
    ],
    profileImage: { type: String, default: 'defaults/profile.jpg' },
    coverImage: { type: String, default: null },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: [31.2357, 30.0444] },
    },
    categories: [{ type: Schema.Types.ObjectId, ref: MODELS.category, default: null }],
    acceptedProjectsCounter: { type: Number, default: 0 },
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
    fcmTokens: [{ fcmToken: String, deviceId: String }],
    followCount: {
      followers: { type: Number, default: 0 },
      following: { type: Number, default: 0 },
    },
    address: { type: String, default: null },
    likes: { type: Number, default: 0 },
    rank: {
      title: { type: String, default: null },
      nextRankPercentage: { type: Number, default: 0 },
      nextRankTitle: { type: String, default: null },
      color: { type: String, default: null },
    },
    profileViews: { type: Number, default: 0 },
    projectsView: { type: Number, default: 0 },
    haveInvitation: { type: Boolean, default: false },
    faceRecognition: { type: String, default: null },
    projectsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: MODELS.user,
    toJSON: {
      transform(doc, ret) {
        if (ret.coverImage) ret.coverImage = process.env.BUCKET_HOST + '/' + ret.coverImage;
        if (ret.profileImage) ret.profileImage = process.env.BUCKET_HOST + '/' + ret.profileImage;
        if (ret.faceRecognition)
          ret.faceRecognition = process.env.BUCKET_HOST + '/' + ret.faceRecognition;
      },
    },
  }
)
  .index({ name: 'text' })
  .index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
  if (
    this.isModified('acceptedProjectsCounter') ||
    this.isModified('likes') ||
    this.isModified('projectsCount')
  ) {
    await updateRankForUser(this as UserDocument);
  }
  next();
});

export const Users = model<Iuser>(MODELS.user, userSchema);
