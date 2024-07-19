import { Irank, PaginationResponse, SuccessResponse , IjwtPayload , Ipagination } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

/* eslint-disable @typescript-eslint/no-namespace */



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
      lang:'ar'|'en';
    }
  }
}


export interface CreateRankHandler
extends RequestHandler<unknown , SuccessResponse<{data:Irank}> , Pick<Irank , 'actionCount' | 'rank' | 'color'> , unknown >{}

export interface UpdateRankHandler
extends RequestHandler<{rankId:string} , SuccessResponse<{data:Irank}> , Partial<Pick<Irank , 'actionCount' | 'rank' | 'color'>> , unknown>{}

export interface GetRankHandler
extends RequestHandler<{rankId:string} , SuccessResponse<{data:Irank}> , unknown , unknown>{}

export interface GetRanksHandler
extends RequestHandler<unknown , PaginationResponse<{data:Irank[]}> , unknown , unknown>{}

export interface DeleteRankHandler
extends RequestHandler<{rankId:string} , SuccessResponse , unknown , unknown>{}