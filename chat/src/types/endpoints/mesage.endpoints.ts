/* eslint-disable @typescript-eslint/no-namespace */
import { SuccessResponse , IjwtPayload , Ipagination, PaginationResponse, ImessageDoc } from '@duvdu-v1/duvdu';
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
      lang: 'ar' | 'en'
    }
  }
}


export interface SendMessageHandler
extends RequestHandler<unknown , SuccessResponse<{data:ImessageDoc}> , Partial<Pick<ImessageDoc , 'content' | 'receiver'>> , unknown>{}

export interface UpdateMessageHandler
extends RequestHandler<{message:string} , SuccessResponse<{data:ImessageDoc}> , Partial<Pick<ImessageDoc , 'content' | 'reactions'>> , unknown >{}

export interface GetLoggedUserChatsHandler
extends RequestHandler<unknown , PaginationResponse<{data:ImessageDoc[][]}> , unknown , {limit?:number , page?:number}>{}

export interface DeleteMessageHandler
extends RequestHandler<{message:string} , SuccessResponse<unknown> , unknown , unknown>{}

export interface DeleteChatHandler
extends RequestHandler<{receiver:string} , SuccessResponse<unknown> , unknown , unknown>{}

export interface GetSpecificChatHandler
extends RequestHandler<{receiver:string} , PaginationResponse<{data:ImessageDoc[] }> , unknown , {limit?:number , page?:number}>{}

export interface GetChatFromUserToUserHandler
extends RequestHandler<{sender:string , receiver:string} , PaginationResponse<{data:ImessageDoc[]}> , unknown , {limit?:number , page?:number , toDate?:Date , fromDate?:Date}>{}

export interface MarkMessageAsWatchedHandler
extends RequestHandler<{receiver:string} , SuccessResponse<unknown> , {messages:[string]} , unknown>{}


