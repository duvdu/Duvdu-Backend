import { IprojectCycle, PaginationResponse, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export interface GetProjectHandler
  extends RequestHandler<
    { projectId: string },
    SuccessResponse<{ data: IprojectCycle }>,
    unknown,
    unknown
  > {}

export interface GetProjectsHandler
  extends RequestHandler<
    unknown,
    PaginationResponse<{ data: IprojectCycle[] }>,
    unknown,
    {
      sortOrder?: 'asc' | 'desc';
    }
  > {}

export interface DeleteProjectHandler
  extends RequestHandler<{ projectId: string }, SuccessResponse, unknown, unknown> {}

export interface GetProjectsForCrmHandler
  extends RequestHandler<
    unknown,
    PaginationResponse<{ data: IprojectCycle[] }>,
    unknown,
    unknown
  > {}
