import { Types, Document } from 'mongoose';

import { Icategory } from './Category';
import { Iplan } from './Plan';

export interface Iuser extends Document {
  id: string;
  googleId?: string;
  appleId?: string;
  name?: string;
  phoneNumber: { key: string; number: string };
  username: string;
  password?: string;
  verificationCode?: { code: string; expireAt: string };
  isVerified?: boolean;
  token?: string;
  profileImage?: string;
  coverImage?: string;
  location?: { lat: number; lng: number };
  category?: Types.ObjectId | Icategory;
  acceptedProjectsCounter: number;
  profileViews: number;
  about?: string;
  isOnline: boolean;
  isAvaliableToInstantProjects: boolean;
  pricePerHour?: number;
  plan: Types.ObjectId | Iplan;
  hasVerificationPadge: boolean;
  avaliableContracts: number;
  rate: { ratersCounter: number; totalRates: number };
  currentRank: string;
  isBlocked: boolean;
  status: { value: boolean; reason: string };
  followCount: { following: number; followers: number };
}
