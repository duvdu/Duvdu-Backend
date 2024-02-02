import { RequestHandler } from 'express';

import { Iuser } from './User';

type successResponse<T> = T & {
  message: 'success';
};

//TODO: open with google
//TODO: open with apple
//TODO: update user to be online while socket connection
//TODO: update user to be offline while socket disconnection
//TODO: update user plan

export interface SigninHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    { username: string; password: string },
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
  extends RequestHandler<unknown, successResponse<unknown>, Pick<Iuser, 'username'>, unknown> {}

export interface UpdateProfileHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
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
      profile: Pick<
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
        | 'plan'
        | 'hasVerificationPadge'
        | 'avaliableContracts'
      > & { averageRate: number };
    }>,
    unknown,
    unknown
  > {}

export interface GetUserProfileHandler
  extends RequestHandler<
    { userId: string },
    successResponse<{
      profile: Pick<
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
        | 'hasVerificationPadge'
      > & { averageRate: number };
    }>,
    unknown,
    unknown
  > {}
