import { SuccessResponse, PaginationResponse, Inotification } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export interface GetLoggedUserNotificationHandler
  extends RequestHandler<
    unknown,
    PaginationResponse<{ data: Inotification[] } & { unWatchiedCount: number }>,
    unknown,
    { limit?: number; page?: number }
  > {}

export interface UpdateWatchNotificationHandler
  extends RequestHandler<unknown, SuccessResponse<unknown>, unknown, unknown> {}

export interface UpdateOneWatchNotificationHandler
  extends RequestHandler<{ notificationId: string }, SuccessResponse<unknown>, unknown, unknown> {}

export interface GetNotificationsCrmHandler
  extends RequestHandler<
    unknown,
    PaginationResponse<{ data: Inotification[] }>,
    unknown,
    unknown
  > {}

export interface SendNotificationForSpecificTopicHandler
  extends RequestHandler<
    unknown,
    SuccessResponse,
    { topic: string; message: string; title: string },
    unknown
  > {}

export interface SendNotificationMultiUserHandler
  extends RequestHandler<
    unknown,
    SuccessResponse,
    { users: string[]; message: string; title: string },
    unknown
  > {}
