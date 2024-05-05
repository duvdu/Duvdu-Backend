import { SuccessResponse ,PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Inotification } from '../../models/notification.model';







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
 extends RequestHandler<unknown , PaginationResponse<{data:Inotification[]}> , unknown , unknown>{}