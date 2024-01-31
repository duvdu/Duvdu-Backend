import { Types, Document } from 'mongoose';

export interface Iuser extends Document {
  id: string;
  googleId?: string;
  appleId?: string;
  name?: string;
  phoneNumber: { key: string; number: string };
  username: string;
  password?: string;
  verificationCode?: { code: string; expireAt: number };
  isVerified?: boolean;
  token?: string;
  profileImage?: string;
  coverImage?: string;
  location?: { lat: number; lng: number };
  category?: Types.ObjectId;
  acceptedProjectsCounter: number;
  profileViews: number;
  about?: string;
  isOnline: boolean;
  isAvaliableToInstantProjects: boolean;
  pricePerHour?: number;
  plan: Types.ObjectId;
  hasVerificationPadge: boolean;
  avaliableContracts: number;
  rate: { ratersCounter: number; totalRates: number };
  isBlocked: boolean;
  status: { value: boolean; reason: string };
  followCount: { following: number; followers: number };
}
