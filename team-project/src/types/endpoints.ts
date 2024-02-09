import { RequestHandler } from 'express';
import { Iproject } from './Project';
import { Iorder } from './Order';

type successResponse<T> = T & {
  message: 'success';
};

export interface CreateProjectHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Pick<
      Iproject,
      | 'cover'
      | 'title'
      | 'category'
      | 'budget'
      | 'desc'
      | 'location'
      | 'attachments'
      | 'shootingDays'
      | 'startDate'
      | 'creatives'
    >
  > {}

export interface UpdateProjectHandler
  extends RequestHandler<
    { projectId: string },
    successResponse<unknown>,
    Partial<
      Pick<
        Iproject,
        | 'attachments'
        | 'cover'
        | 'title'
        | 'category'
        | 'budget'
        | 'desc'
        | 'location'
        | 'attachments'
        | 'shootingDays'
        | 'startDate'
        | 'creatives'
      >
    >
  > {}

export interface GetProjectsHandler
  extends RequestHandler<
    { userId: string },
    successResponse<{
      count: number;
      data: Iproject[];
    }>
  > {}

export interface GetProjectHandler
  extends RequestHandler<{ projectId: string }, successResponse<{ data: Iproject }>> {}

export interface RemoveProjectHandler
  extends RequestHandler<{ projectId: string }, successResponse<unknown>> {}

export interface BookProjectHandler
  extends RequestHandler<{ projectId: string }, successResponse<unknown>> {}

export interface ActionTeamProjectOffer
  extends RequestHandler<{ projectId: string }, successResponse<unknown>, { accept: boolean }> {}
