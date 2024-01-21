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
    undefined,
    successResponse<unknown>,
    Pick<Iuser, 'username' | 'password'>,
    undefined
  > {}

export interface SignupHandler
  extends RequestHandler<
    undefined,
    successResponse<unknown>,
    Pick<Iuser, 'name' | 'phoneNumber' | 'username' | 'password'>,
    undefined
  > {}

export interface RetreiveUsernameHandler
  extends RequestHandler<
    undefined,
    successResponse<{ isUsernameExists: boolean }>,
    Pick<Iuser, 'username'>,
    undefined
  > {}

export interface AskUpdatePhoneNumberHandler
  extends RequestHandler<undefined, successResponse<unknown>, Pick<Iuser, 'password'>, undefined> {}

export interface UpdatePhoneNumberHandler
  extends RequestHandler<
    undefined,
    successResponse<unknown>,
    Pick<Iuser, 'verificationCode' | 'phoneNumber'>,
    undefined
  > {}

export interface ChangePasswordHandler
  extends RequestHandler<
    undefined,
    successResponse<unknown>,
    { oldPassword: string; newPassword: string },
    undefined
  > {}

export interface AskResetPasswordHandler
  extends RequestHandler<undefined, successResponse<unknown>, Pick<Iuser, 'username'>, undefined> {}

export interface ResetPasswordHandler
  extends RequestHandler<
    undefined,
    successResponse<unknown>,
    Pick<Iuser, 'verificationCode' | 'username' | 'password'>,
    undefined
  > {}

export interface ResendVerificationCodeHandler
  extends RequestHandler<undefined, successResponse<unknown>, Pick<Iuser, 'username'>, undefined> {}

export interface UpdateProfileHandler
  extends RequestHandler<
    undefined,
    successResponse<unknown>,
    Partial<
      Pick<
        Iuser,
        | 'name'
        | 'profileImage'
        | 'coverImage'
        | 'location'
        | 'categroy'
        | 'about'
        | 'isAvaliableToInstantProjects'
        | 'pricePerHour'
      >
    >,
    undefined
  > {}

export interface getLoggedUserProfileHandler
  extends RequestHandler<
    undefined,
    successResponse<
      Pick<
        Iuser,
        | 'id'
        | 'name'
        | 'phoneNumber'
        | 'username'
        | 'profileImage'
        | 'coverImage'
        | 'location'
        | 'categroy'
        | 'acceptedProjectsCounter'
        | 'profileViews'
        | 'about'
        | 'isOnline'
        | 'isAvaliableToInstantProjects'
        | 'pricePerHour'
        | 'plan'
        | 'hasVerificationPadge'
        | 'avaliableContracts'
      > & { averageRate: number }
    >,
    undefined,
    undefined
  > {}

export interface getUserProfileHandler
  extends RequestHandler<
    { userId: string },
    successResponse<
      Pick<
        Iuser,
        | 'id'
        | 'name'
        | 'phoneNumber'
        | 'username'
        | 'profileImage'
        | 'coverImage'
        | 'location'
        | 'categroy'
        | 'acceptedProjectsCounter'
        | 'profileViews'
        | 'about'
        | 'isOnline'
        | 'isAvaliableToInstantProjects'
        | 'pricePerHour'
        | 'hasVerificationPadge'
      > & { averageRate: number }
    >,
    undefined,
    undefined
  > {}
