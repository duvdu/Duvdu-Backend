import { RequestHandler } from 'express';

import { Iproject } from '../Projects';
import { IsavedProject } from '../SavedProjects';

type successResponse<T> = T & {
  message: 'success';
};
//TODO: create favourite savedProjects on signup
export interface createSavedProjectHandler
  extends RequestHandler<unknown, successResponse<unknown>, { title: string }, unknown> {}

export interface addProjectToSavedProjectHandler
  extends RequestHandler<
    { savedProjectId: string },
    successResponse<unknown>,
    { projectId: string },
    unknown
  > {}

export interface removeProjectFromSavedProjectHandler
  extends RequestHandler<
    { savedProjectId: string },
    successResponse<unknown>,
    { projectId: string },
    unknown
  > {}

export interface getSavedProjectHandler
  extends RequestHandler<
    unknown,
    successResponse<{ data: IsavedProject & { projects: Iproject[] } }>
  > {}

export interface getSavedProjectsHandler
  extends RequestHandler<unknown, successResponse<{ data: IsavedProject }>> {}

export interface updateSavedProjectHandler
  extends RequestHandler<
    { savedProjectId: string },
    successResponse<unknown>,
    { title: string },
    unknown
  > {}

export interface removeSavedProjectHandler
  extends RequestHandler<{ savedProjectId: string }, successResponse<unknown>, unknown, unknown> {}
