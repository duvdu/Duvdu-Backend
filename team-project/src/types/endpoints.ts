/* eslint-disable @typescript-eslint/no-namespace */
import { IjwtPayload, Ipagination } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { IteamProject } from '../models/teamProject.model';


declare module 'express-session' {
  interface SessionData {
    access: string;
    refresh: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      loggedUser: IjwtPayload;
      pagination: Ipagination;
      lang: 'ar'|'en'
    }
  }
}


type successResponse<T> = T & {
  message: 'success';
};

export interface CreateProjectHandler
  extends RequestHandler<
    unknown,
    successResponse<{data:IteamProject}>,
    Pick<
      IteamProject,
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
    successResponse<{data:IteamProject}>,
    Partial<
      Pick<
      IteamProject,
        | 'attachments'
        | 'cover'
        | 'title'
        | 'budget'
        | 'desc'
        | 'location'
        | 'attachments'
        | 'shootingDays'
        | 'startDate'
        | 'address'
      >
    >
  > {}

export interface GetProjectsHandler
  extends RequestHandler<
    { userId: string },
    successResponse<{ data: IteamProject[] }>,
    unknown,
    unknown
  > {}

export interface GetProjectHandler
  extends RequestHandler<{ projectId: string }, successResponse<{ data: IteamProject }> , unknown , unknown> {}

export interface RemoveProjectHandler
  extends RequestHandler<{ projectId: string }, successResponse<unknown> , unknown , unknown> {}

export interface ActionTeamProjectOffer
  extends RequestHandler<{ projectId: string }, successResponse<unknown>, { accept: boolean , category:string } , unknown> {}

export interface DeleteCreativeHandler
  extends RequestHandler<{projectId:string} , successResponse<unknown> , {category:string , user:string} , unknown>{}