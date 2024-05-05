import { Types } from 'mongoose';

import { Icategory } from './Category';
import { Irole } from './Role';

export enum VerificationReason {
  updateOldPhoneNumber = 'update-old-phone-number',
  updateOldPhoneNumberVerified = 'update-old-phone-number-verified',
  updateNewPhoneNumber = 'update-new-phone-number',
  verifyUpdatedPhoneNumber = 'verify-updated-phone-number',
  forgetPassword = 'forget-password',
  forgetPasswordVerified = 'forget-password-verified',
  signup = 'signup',
  completeSginUp = 'complete-sginup',
  CompleteSginUpVerfied = 'complete-sginup-verified'
}
export interface Iuser {
  id: string;
  googleId?: string;
  appleId?: string;
  name?: string;
  phoneNumber: { key: string; number: string };
  username: string;
  password?: string;
  verificationCode?: { code?: string; expireAt?: string; reason?: VerificationReason };
  isVerified: boolean;
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
  pricePerHour: number;
  role: Types.ObjectId | Irole;
  hasVerificationBadge: boolean;
  avaliableContracts: number;
  rate: { ratersCounter: number; totalRates: number };
  currentRank: string;
  isBlocked: { value: boolean; reason: string };
  followCount: { following: number; followers: number };
  notificationToken:string | null
}
