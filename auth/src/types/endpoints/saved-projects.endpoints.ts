import { RequestHandler } from 'express';

import { Ibookmark } from '../Bookmarks';

type successResponse<T> = T & {
  message: 'success';
};
//TODO: fire event to send notification
export interface CreateBookmarkHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    { title: string; projects: [string] },
    unknown
  > {}

export interface AddProjectToBookmarkHandler
  extends RequestHandler<{ bookmarkId: string; projectId: string }, successResponse<unknown>> {}

export interface RemoveProjectFromBookmarkHandler
  extends RequestHandler<{ bookmarkId: string; projectId: string }, successResponse<unknown>> {}

export interface GetBookmarkHandler
  extends RequestHandler<{ bookmarkId: string }, successResponse<{ data: Ibookmark }>> {}

export interface GetBookmarksHandler
  extends RequestHandler<unknown, successResponse<{ data: Ibookmark[] }>> {}

export interface UpdateBookmarkHandler
  extends RequestHandler<
    { bookmarkId: string },
    successResponse<unknown>,
    { title: string },
    unknown
  > {}

export interface RemoveBookmarkHandler
  extends RequestHandler<{ bookmarkId: string }, successResponse<unknown>, unknown, unknown> {}
