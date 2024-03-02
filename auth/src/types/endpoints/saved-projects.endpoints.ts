import { RequestHandler } from 'express';

import { IsavedProject } from '../SavedProjects';

type successResponse<T> = T & {
  message: 'success';
};
//TODO: fire event to send notification
export interface CreateSavedProjectHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    { title: string; projects: [string] },
    unknown
  > {}

export interface AddProjectToSavedProjectHandler
  extends RequestHandler<{ savedProjectId: string; projectId: string }, successResponse<unknown>> {}

export interface RemoveProjectFromSavedProjectHandler
  extends RequestHandler<{ savedProjectId: string; projectId: string }, successResponse<unknown>> {}

export interface GetSavedProjectHandler
  extends RequestHandler<{ savedProjectId: string }, successResponse<{ data: IsavedProject }>> {}

export interface GetSavedProjectsHandler
  extends RequestHandler<unknown, successResponse<{ data: IsavedProject[] }>> {}

export interface UpdateSavedProjectHandler
  extends RequestHandler<
    { savedProjectId: string },
    successResponse<unknown>,
    { title: string },
    unknown
  > {}

export interface RemoveSavedProjectHandler
  extends RequestHandler<{ savedProjectId: string }, successResponse<unknown>, unknown, unknown> {}
