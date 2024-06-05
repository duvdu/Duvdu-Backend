/* eslint-disable @typescript-eslint/no-namespace */
import { IjwtPayload, Ipagination, Iuser } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

type successResponse<T> = T & {
  message: 'success';
};

/* eslint-disable @typescript-eslint/no-namespace */

declare module 'express-session' {
  interface SessionData {
    access: string;
    refresh: string;
    mobileAccess:string;
    mobileRefresh:string;
  }
}

declare global {
  namespace Express {
    interface Request {
      loggedUser: IjwtPayload;
      pagination: Ipagination;
      lang: 'ar' | 'en';
    }
  }
}

//TODO: open with google
//TODO: open with apple
//TODO: update user to be online while socket connection
//TODO: update user to be offline while socket disconnection
//TODO: update user plan

export interface SigninHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    { username: string; password: string; notificationToken?: string },
    unknown
  > {}

export interface SignupHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    {
      name: string;
      phoneNumber: { key: string; number: string };
      username: string;
      password: string;
      notificationToken?: string;
    },
    unknown
  > {}

export interface RetreiveUsernameHandler
  extends RequestHandler<
    unknown,
    successResponse<{ isUsernameExists: boolean }>,
    Pick<Iuser, 'username'>,
    unknown
  > {}

export interface AskUpdatePhoneNumberHandler
  extends RequestHandler<unknown, successResponse<unknown>, Pick<Iuser, 'password'>, unknown> {}

export interface UpdatePhoneNumberHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    { verificationCode: string; phoneNumber: string },
    unknown
  > {}

export interface VerifyUpdatePhoneNumberHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    { verificationCode: string; phoneNumber: string },
    unknown
  > {}

export interface ChangePasswordHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    { oldPassword: string; newPassword: string },
    unknown
  > {}

export interface AskResetPasswordHandler
  extends RequestHandler<unknown, successResponse<unknown>, Pick<Iuser, 'username'>, unknown> {}

export interface ResetPasswordHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    { verificationCode: string; username: string; newPassword: string },
    unknown
  > {}

export interface ResendVerificationCodeHandler
  extends RequestHandler<unknown, successResponse<unknown>, Pick<Iuser, 'username'>> {}

export interface UpdateProfileHandler
  extends RequestHandler<
    unknown,
    successResponse<{ data: Iuser }>,
    Partial<
      Pick<
        Iuser,
        | 'name'
        | 'profileImage'
        | 'coverImage'
        | 'location'
        | 'category'
        | 'about'
        | 'isAvaliableToInstantProjects'
        | 'pricePerHour'
      >
    >,
    unknown
  > {}

export interface GetLoggedUserProfileHandler
  extends RequestHandler<
    unknown,
    successResponse<{
      data: Pick<
        Iuser,
        | 'id'
        | 'name'
        | 'phoneNumber'
        | 'username'
        | 'profileImage'
        | 'coverImage'
        | 'location'
        | 'category'
        | 'acceptedProjectsCounter'
        | 'profileViews'
        | 'about'
        | 'isOnline'
        | 'isAvaliableToInstantProjects'
        | 'pricePerHour'
        | 'hasVerificationBadge'
        | 'currentRank'
      >;
    }>,
    unknown,
    unknown
  > {}

export interface GetUserProfileHandler
  extends RequestHandler<
    { username: string },
    successResponse<{
      data: Pick<
        Iuser,
        | 'id'
        | 'name'
        | 'phoneNumber'
        | 'username'
        | 'profileImage'
        | 'coverImage'
        | 'location'
        | 'category'
        | 'acceptedProjectsCounter'
        | 'profileViews'
        | 'about'
        | 'isOnline'
        | 'isAvaliableToInstantProjects'
        | 'pricePerHour'
        | 'hasVerificationBadge'
        | 'currentRank'
      > & { averageRate: number };
    }>,
    unknown,
    unknown
  > {}

export interface CompleteSginUpHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Pick<Iuser, 'phoneNumber' | 'username' | 'name'>,
    unknown
  > {}

export interface LogoutHandler
extends RequestHandler<unknown , successResponse<unknown> , unknown , unknown>{}