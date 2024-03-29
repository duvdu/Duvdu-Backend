import { Iuser } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';


type successResponse<T> = T & {
  message: 'success';
};
// TODO: while follow fire event to socket to send notification
export interface FollowHandler
  extends RequestHandler<{ targetUserId: string }, successResponse<unknown>> {}

export interface UnFollowHandler
  extends RequestHandler<{ targetUserId: string }, successResponse<unknown>> {}

export interface GetFollowersHandler
  extends RequestHandler<
    unknown,
    successResponse<{ data: Pick<Iuser, 'id' | 'name' | 'profileImage'> }[]>
  > {}

export interface GetFollowingHandler
  extends RequestHandler<
    unknown,
    successResponse<{ data: Pick<Iuser, 'id' | 'name' | 'profileImage'> }[]>
  > {}
