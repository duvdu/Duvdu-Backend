/* eslint-disable @typescript-eslint/no-namespace */
import { IjwtPayload, Ipagination, IteamProject, PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';



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
    unknown,
    PaginationResponse<{ data: IteamProject[] }>,
    unknown,
    unknown
  > {}

export interface GetProjectsCrmHandler
  extends RequestHandler<
    unknown,
    PaginationResponse<{ data: IteamProject[] }>,
    unknown,
    unknown
  > {}

export interface GetProjectHandler
  extends RequestHandler<{ projectId: string }, successResponse<{ data: IteamProject }> , unknown , unknown> {}

export interface RemoveProjectHandler
  extends RequestHandler<{ projectId: string }, successResponse<unknown> , unknown , unknown> {}

export interface ActionTeamProjectOffer
  extends RequestHandler<{ projectId: string }, successResponse<unknown>, { status: boolean , craetiveScope:string } , unknown> {}

export interface DeleteCreativeHandler
  extends RequestHandler<{projectId:string} , successResponse<unknown> , {craetiveScope:string , user:string} , unknown>{}

export interface UpdateCreativeHandler
extends RequestHandler<{projectId:string} , successResponse<{data:IteamProject}> , Partial<{totalAmount?:number , workHours?:number , craetiveScope?:string , user?:string}> , unknown>{}

export interface AddCretiveHandler
extends RequestHandler<{projectId:string} , successResponse<unknown> ,{totalAmount?:number , workHours?:number , craetiveScope?:string , user?:string} , unknown >{}