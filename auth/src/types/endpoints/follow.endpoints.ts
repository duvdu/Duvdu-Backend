import { Ifollow, PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';


type successResponse<T> = T & {
  message: 'success';
};
// TODO: while follow fire event to socket to send notification
export interface FollowHandler
  extends RequestHandler<{ userId: string }, successResponse<unknown>> {}

export interface UnFollowHandler
  extends RequestHandler<{ userId: string }, successResponse<unknown>> {}

export interface GetFollowersHandler
  extends RequestHandler<
    unknown,
    PaginationResponse<{ data:Ifollow[]}>
  > {}

export interface GetFollowingHandler
  extends RequestHandler<
    unknown,
    PaginationResponse<{ data: Ifollow[] }>
  > {}
