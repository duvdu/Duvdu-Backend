/* eslint-disable @typescript-eslint/no-namespace */
import {
  PaginationResponse,
  SuccessResponse,
  IjwtPayload,
  Ipagination,
  ITeamProject,
} from '@duvdu-v1/duvdu';
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
        lang: 'ar' | 'en';
      }
    }
  }
  
export interface CreateProjectHandler
    extends RequestHandler<
      unknown,
      SuccessResponse<{ data: ITeamProject }>,
      Pick<ITeamProject, 'title' | 'desc' | 'cover' | 'location' | 'address' >,
      unknown
    > {}
  
export interface AddCreativeHandler
    extends RequestHandler<
      { teamId: string },
      SuccessResponse<{ data: ITeamProject }>,
      {
        user: string;
        attachments: string[];
        duration: string;
        startDate: string;
        workHours: number;
        hourPrice: number;
        details: string;
        category: string;
      },
      unknown
    > {}
  
export interface DeleteCreativeHandler
    extends RequestHandler<
      { teamId: string },
      SuccessResponse,
      { category: string; user: string },
      unknown
    > {}
  
export interface DeleteCategoryHandler
    extends RequestHandler<{ teamId: string }, SuccessResponse, { category: string }, unknown> {}
  
export interface GetProjectsHandler
    extends RequestHandler<unknown, PaginationResponse<{ data: ITeamProject[] }>, unknown, unknown> {}
  
export interface GetProjectHandler
    extends RequestHandler<
      { teamId: string },
      SuccessResponse<{ data: ITeamProject }>,
      unknown,
      unknown
    > {}
  
export interface DeleteProjectHandler
    extends RequestHandler<{ teamId: string }, SuccessResponse, unknown, unknown> {}
  
export interface GetTeamsCrmHandler
    extends RequestHandler<unknown, PaginationResponse<{ data: ITeamProject[] }>, unknown, unknown> {}
  
export interface GetTeamCrmHandler
    extends RequestHandler<
      { teamId: string },
      SuccessResponse<{ data: ITeamProject }>,
      unknown,
      unknown
    > {}